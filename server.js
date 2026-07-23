const startApp =
  require(
    "./src/app"
  );


startApp()
  .catch(
    (error) => {

      console.error(
        "Worker Service Failed:",
        error
      );

      process.exit(1);

    }
  );