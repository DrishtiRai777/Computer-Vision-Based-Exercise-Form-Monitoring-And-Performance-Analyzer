export function getFeedbackMap(feedbackArray) {
  const map = {};
  feedbackArray.forEach(item => {
    map[item] = (map[item] || 0) + 1;
  });
  return map;
}