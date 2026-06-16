const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(
      `${env} environment variable missing`
    );
  }
});