'use strict';

function trimStack(stack, num) {
  return stack && stack.split('\n').slice(num).join('\n');
}

function stackCapture(reason) {
  var e = new Error();
  return 'Stack capture: ' + reason + '\n' +
    trimStack(e.stack, 2);
}


module.exports = {
  trimStack: trimStack,
  stackCapture: stackCapture
};
