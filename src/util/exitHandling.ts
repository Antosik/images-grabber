const isWindows = /^win/.test(process.platform);

const thxString = `\n  Thanks for using our service! ^^\n`;
process.on("exit", () => {
  process.stdout.write(thxString);
  process.exit(0);
});
process.on("SIGINT", () => {
  process.exit(0);
});
process.on("SIGTERM", () => {
  process.exit(0);
});
process.on("uncaughtException", () => {
  process.stderr.write(
    `\n  Unhandled error D: \nPlease write about it at https://github.com/Antosik/images-grabber/issues`
  );
  process.exit(0);
});

if (isWindows) {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function() {
    process.exit(0);
  });
}
