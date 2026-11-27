// Next's after(), stood in for the sign-in code only: the work goes on by itself while the answer goes back,
// as after() does inside a request. The shop's own code logs any failure.
export function after(task) {
  const work = typeof task === 'function' ? Promise.resolve().then(task) : Promise.resolve(task)
  work.catch(() => {})
}
