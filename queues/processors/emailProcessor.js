const Email = require('../../utils/email');

module.exports = async (job) => {
  const { user, url, type } = job.data;

  switch (type) {
    case 'welcome':
      await new Email(user, url).sendWelcome();
      break;
    case 'passwordReset':
      await new Email(user, url).sendPasswordReset();
      break;
    default:
      console.error(`Unknown job type: ${type}`);
  }
};
