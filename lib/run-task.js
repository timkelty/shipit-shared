module.exports = function runTask(gruntOrShipit, task) {
  if (gruntOrShipit.task && gruntOrShipit.task.run) {
    return gruntOrShipit.task.run(task);
  }

  return gruntOrShipit.start(task);
};
