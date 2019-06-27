import minBy from "lodash.minby"
import { distance } from "./math.js";

function permutationsWithSkips(items, skip) {
  if (items.length === skip) {
    return []
  } else if (skip === 0) {
    return [items]
  } else if (skip === 1) {
    let results = []
    for (let skipIndex = 0; skipIndex < items.length; skipIndex++) {
      results.push(items.slice(0, skipIndex).concat(items.slice(skipIndex + 1)))
    }
    return results
  } else {
    const withoutFirst = items.slice(1)
    const skippedFirst = permutationsWithSkips(withoutFirst, skip - 1)
    const includedFirst = permutationsWithSkips(withoutFirst, skip).map(entries => [items[0]].concat(entries))

    return skippedFirst.concat(includedFirst)
  }
}

export default function(ring, vs) {
  let pointsToAdd = vs.length - ring.length;

  if (pointsToAdd < 0) {
    console.log('rotate backwards todo')
  }

  let len = ring.length,
      min = Infinity,
      bestCombination,
      spliced;

  for (let offset = 0; offset < len; offset++) {

    // apply offset before sending permutations
    // ring[(offset + i) % len]

    // since vs has more points, get every combination vs with points removed in various positions
    const offsetVs = vs.slice(offset).concat(vs.slice(0, offset))
    const vsCombinations = permutationsWithSkips(offsetVs, pointsToAdd)
    console.log('vsCombinations', vsCombinations.length)

    // find the best vsCombination
    vsCombinations.forEach((vsCombination) => {
      let sumOfSquares = 0;
      ring.forEach(function(p, i){
        let d = distance(vsCombination[i], p);
        sumOfSquares += d * d;
      });

      if (sumOfSquares < min) {
        min = sumOfSquares;
        bestCombination = vsCombination;
      }

      return sumOfSquares
    })

  }

  // now that we know the best points to match to vs, we need to add points in the best places
  // make an array with holes to be filled with new points
  const resultRing = []
  bestCombination.forEach((entry, i) => {
    const index = vs.indexOf(entry)
    resultRing[index] = ring[i]
  })

  // insert - stat with simpleadding at midoint, then explore parallel distance
  // now we have an array with holes, fill the holes
  for (let i = 0; i < vs.length; i++) {
    if (!resultRing[i]) {
      // midpoint
      const prev = resultRing[(i - 1 < 0) ? vs.length - 1 : i - 1]
      const next = resultRing[(i + 1 > vs.length - 1) ? 0 : i + 1]

      const midX = (prev[0] + next[0]) / 2
      const midY = (prev[1] + next[1]) / 2

      resultRing[i] = [midX, midY]
    }
  }

  // const bestCombinationIndexes = bestCombination.map(entry => ring.indexOf(entry))

  console.log('resultRing', resultRing)

  ring.splice(0, ring.length, ...resultRing)

  // if (bestCombination) {
  //   spliced = ring.splice(0, bestCombination);
  //   ring.splice(ring.length, 0, ...spliced);
  // }
}
