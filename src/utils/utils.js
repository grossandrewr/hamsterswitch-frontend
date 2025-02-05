 export const cycleProgressText = setProgressText => {
  const stringTimingMap = [
    ["Analyzing your query... ", 0],
    ["Running the algorithm... ", 1000],
    ["Processing albums...", 3750],
    ["Almost ready... ", 6500]
  ]
  stringTimingMap.forEach(([text, time]) => {
    setTimeout(() => setProgressText(text), time)
  })
}
