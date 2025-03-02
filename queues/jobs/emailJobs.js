const emailQueue = require('../emailQueue');

exports.addEmailJob = (user, url, type) => {
  emailQueue.add({ user, url, type });
};
