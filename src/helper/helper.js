const logger = require('../config/logger');
const PubSub = require('../pubsub');
const normalizeWhatsAppMessage = async ({
                                          message,
                                          whatsappMessage
                                        }) => {

  const handledMessageTypes = [
    'text',
    'location',
    'contacts',
    'button',
    'image',
    'video',
    'voice',
    'audio',
    'document',
    'sticker'
  ];

  const type =
    message?.type;


  // ========================================
  // UNSUPPORTED TYPE
  // ========================================

  if (
    !handledMessageTypes.includes(type)
  ) {

    logger.info(
      'Message Type Not Supported',
      {
        type,
        message
      }
    );

    throw new Error(
      'Message Type Not Supported'
    );

  }


  // ========================================
  // TEXT
  // ========================================

  if (
    type === 'text' && !message?.referral &&
    typeof message.referral !== "object"
  ) {

    return {

      ...whatsappMessage,

      message:
        message?.text?.body || null,

      messageType:
        'text'

    };

  }


  // ========================================
  // BUTTON
  // ========================================

  if (
    type === 'button'
  ) {

    return {

      ...whatsappMessage,

      message:
        message?.button?.text || null,

      messageType:
        'text'

    };

  }


  // ========================================
  // LOCATION
  // ========================================

  if (
    type === 'location'
  ) {

    return {

      ...whatsappMessage,

      message:
        null,

      messageType:
        'multimedia',

      attachments: [

        {

          type:
            'location',

          data: {

            title:
              null,

            url:
              null,

            latitude:
              message?.location?.latitude || null,

            longitude:
              message?.location?.longitude || null

          }

        }

      ]

    };

  }


  // ========================================
  // CONTACTS
  // ========================================

  if (
    type === 'contacts'
  ) {

    return {

      ...whatsappMessage,

      message:
        null,

      messageType:
        'multimedia',

      attachments: [

        {

          type:
            'contacts',

          data: {

            contacts:
              message?.contacts || []

          }

        }

      ]

    };

  }


  // ========================================
  // MEDIA
  // ========================================

  const mediaTypes = [

    'text',

    'image',

    'video',

    'voice',

    'audio',

    'document',

    'sticker'

  ];


  if (
    mediaTypes.includes(type)
  ) {

    return {

      ...whatsappMessage,

      message:
        null,

      // messageType:
      //   'multimedia',

      attachments:

        setInteractionMediaMessage(
          message, whatsappMessage
        )

    };

  }


  return whatsappMessage;

};


const setInteractionMediaMessage = async (
  message,
  whatsappMessage
) => {

  const type =
    message?.type;


  // ========================================
  // WHATSAPP REFERRAL / AD MEDIA
  // ========================================

  if (
    type === "text" &&
    message?.referral &&
    typeof message.referral === "object"
  ) {

    const referral =
      message.referral;


    // No referral media
    if (
      !referral?.image_url &&
      !referral?.video_url
    ) {

      return {

        ...whatsappMessage,

        messageType:
          "text"

      };

    }


    let mediaType =
      null;


    let mediaUrl =
      null;


    // ========================================
    // IMAGE REFERRAL
    // ========================================

    if (
      referral.media_type === "image"
    ) {

      const imageUrl =
        referral?.image_url;


      const isActualImage =
        imageUrl &&
        /\.[^/]+$/.test(
          new URL(imageUrl).pathname
        );


      mediaUrl =
        isActualImage
          ? imageUrl
          : referral?.thumbnail_url;


      mediaType =
        "image";

    }


      // ========================================
      // VIDEO REFERRAL
    // ========================================

    else if (
      referral.media_type === "video"
    ) {

      const videoUrl =
        referral?.video_url;


      const isActualVideo =
        videoUrl &&
        /\.[^/]+$/.test(
          new URL(videoUrl).pathname
        );


      mediaUrl =
        isActualVideo
          ? videoUrl
          : referral?.thumbnail_url;


      mediaType =
        isActualVideo
          ? "video"
          : "image";

    }


    const extraPayload = {

      ...whatsappMessage?.extraPayload,

      mediaId:
      message?.id,

      type:
      referral?.source_type

    };


    // ========================================
    // AD / POST DATA
    // ========================================

    if (
      referral?.source_type === "ad" ||
      referral?.source_type === "post"
    ) {

      extraPayload.adUrl =
        referral?.source_url || null;

      extraPayload.adHeadline =
        referral?.headline || null;

    }


    return {

      ...whatsappMessage,

      messageType:
        "multimedia",

      attachments:
        mediaType && mediaUrl

          ? [

            {

              type:
              mediaType,

              data: {

                url:
                mediaUrl

              }

            }

          ]

          : [],

      extraPayload

    };

  }


  // ========================================
  // NORMAL WHATSAPP MEDIA
  // ========================================

  const mediaConfig = {

    image: {

      caption:
      message?.image?.caption,

      mediaId:
      message?.image?.id,

      mimeType:
      message?.image?.mime_type

    },

    video: {

      caption:
      message?.video?.caption,

      mediaId:
      message?.video?.id,

      mimeType:
      message?.video?.mime_type

    },

    audio: {

      caption:
      message?.audio?.caption,

      mediaId:
      message?.audio?.id,

      mimeType:
      message?.audio?.mime_type

    },

    voice: {

      caption:
      message?.voice?.caption,

      mediaId:
      message?.voice?.id,

      mimeType:
      message?.voice?.mime_type.split(';')[0]

    },

    document: {

      caption:
      message?.document?.caption,

      mediaId:
      message?.document?.id,

      mimeType:
      message?.document?.mime_type

    },

    sticker: {

      caption:
      message?.sticker?.caption,

      mediaId:
      message?.sticker?.id,

      mimeType:
      message?.sticker?.mime_type

    }

  };


  const media =
    mediaConfig[type];


  // ========================================
  // NOT A MEDIA MESSAGE
  // ========================================

  if (!media) {

    return whatsappMessage;

  }


  // ========================================
  // NORMALIZED MEDIA MESSAGE
  // ========================================

  return {

    ...whatsappMessage,

    message:
      media.caption || null,

    messageType:
      "multimedia",

    attachments: [

      {

        // Temporary UI placeholder
        // Actual media type is stored separately
        type:
          "image",

        data: {

          originalType:
          type,

          url:
            "",

          downloading:
            true,

          mediaId:
          media?.mediaId,

          mimeType:
          media?.mimeType

        }

      }

    ]

  };

};

const getMediaUrl = (extension, mediaId, token, idx) => {
  let type = response?.attachments[idx]?.data?.originalType
  let url = null

    url = `${ token['integration.wBsp.baseUrl'] }/whatsApp/media/${ extension }/${ mediaId }`

  return {
    url
  }
}

const mediaPublishFunction = async (message, url, mimeType, idx, token) => {
  PubSub?.publish(
    {
      messageId: message?._id,
      interactionId: message?.interactionId,
      extension: message?.extension,
      mediaIndex: idx,
      url,
      mimeType,
      token,
      type:message.attachments[idx]?.data?.originalType || message.attachments[idx]?.type
    },
    "media.processing")
}


module.exports = {
  normalizeWhatsAppMessage,
  setInteractionMediaMessage,
  getMediaUrl,
  mediaPublishFunction
}