module.exports = {
  beforeRequest: (requestParams, context, events, done) => {
    const prompts = [
      "tech startup with AI",
      "eco-friendly products",
      "creative agency names",
      "food delivery service",
      "fitness app names"
    ];
    context.vars.randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    return done();
  }
};