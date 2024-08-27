<script>
  import { draggable } from '@neodrag/svelte'
  import { colors } from '../lib/index.js'
  import { updated } from "$app/stores"

  import tinycolor from "tinycolor2"
  import "../app.css"

  let numTeams            = 12
  let rosterSize          = 16
  let myDraftOrderNumber  = 10
  let activeColor         = randomHex()

  $: matrix  = snakeMatrix(numTeams, rosterSize, myDraftOrderNumber)
  $: picks   = draftPicks(matrix, myDraftOrderNumber)

  function snakeMatrix(numTeams, rosterSize, myDraftOrderNumber) {
    let roundNum    = 1
    let countingUp  = true
    let snakeMatrix = []
    do {
      let round = []
      if (countingUp) { for (let i = 1; i < numTeams+1; i++) { round.push(i) } }
      else { for (let i = numTeams; i > 0; i--) { round.push(i) } }
      snakeMatrix.push(round)
      roundNum += 1
      countingUp = !countingUp
    } while (roundNum < rosterSize+1);
    return snakeMatrix
  }

  function draftPicks(matrix, myDraftOrderNumber) {
    let idx           = 1
    let allPicks      = matrix.flat()
    let myDraftPicks  = []

    while (idx < allPicks.length+1) {
      let teamNum = allPicks[idx]
      if (teamNum == myDraftOrderNumber) { myDraftPicks.push(idx+1)}
      idx++;
    }
    return myDraftPicks
  }

  function overallPickNumber(roundIdx, pickIdx) {
    return (roundIdx*numTeams) + pickIdx + 1
  }

  function darkerIfNeeded(hex) {
    let color = tinycolor(hex)
    let luma = color.getLuminance()
    if (luma > .7) {
      return color.darken(25).toString()
    }
    else {
      return hex
    }
  }

  function randomHex() {
    let codes     = Array.from(colors.keys())
    let randomHex = codes[Math.floor(Math.random() * (colors.size + 1))]
    return randomHex
  }
</script>

<main class="mb-32 mx-auto text-center px-4 md:px-12 py-12" style="--activeColor: {activeColor}; --lightSafeActiveColor: {darkerIfNeeded(activeColor)}">
  <header>
    <h1 class="text-5xl text-[var(--lightSafeActiveColor)] [text-shadow:_0_3px_0_rgb(0_0_0_)]">ask the snake</h1>
  </header>

  <section class="w-full max-w-xl mx-auto text-center mb-12">
    <h2 class="text-xl italic uppercase">when do i get to pick !?!?!?</h2>
    
    <div use:draggable class="mx-auto h-48 w-4/5 bg-cover hover:scale-150 -mt-6 active:cursor-grabbing cursor-grab duration-500 ease-in-out bg-[url('https://media4.giphy.com/media/FAMHmfVnYA10MntgZn/giphy.gif')]">
    </div>

    
    <form class="w-full">
      <div class="my-2 text-left flex flex-wrap">
        <label for="numTeams" class="basis-2/3 rounded-l-lg border border-black bg-black text-white px-2 py-1">
          number of teams
        </label>
        <input id="numTeams" type="number" bind:value={numTeams} min="1" max="50" class="font-mono basis-1/3 rounded-r-lg border border-black text-right px-2 bg-white focus:outline-none">
      </div>

      <div class="my-2 text-left flex flex-wrap">
        <label for="rosterSize" class="basis-2/3 rounded-l-lg border border-black bg-black text-white px-2 py-1">
          roster size
        </label>
        <input id="rosterSize" type="number" bind:value={rosterSize} min="5" max="50" class="font-mono basis-1/3 rounded-r-lg border border-black text-right px-2 bg-white focus:outline-none">
      </div>

      <div class="my-2 text-left flex flex-wrap">
        <label for="myDraftOrderNumber" class="basis-2/3 rounded-l-lg border border-black bg-black text-white px-2 py-1">
          my draft order
        </label>
        <input id="myDraftOrderNumber" type="number" bind:value={myDraftOrderNumber} min="1" max="{numTeams}" class="basis-1/3 font-mono rounded-r-lg border border-black text-right px-2 bg-white focus:outline-none">
      </div>

      <div class="my-2 text-left flex flex-wrap">
        <label for="myFavColor" class="basis-2/3 rounded-l-lg border border-black bg-black text-white px-2 py-1">
          my favorite color
        </label>
        <select id="myFavColor" bind:value={activeColor} class="min-w-0 basis-1/3 overflow-x-scroll font-mono rounded-r-lg border border-black text-right pr-2 bg-white focus:outline-none">
          {#each colors as [hex, name]}
          <option value={hex} class="downcase font-mono">
            <div class="w-2 h-2 bg-[{hex}]"></div>
            {name.toLowerCase()}
          </option>
          {/each}
        </select>
      </div>
    </form>
  </section>

  <section class="my-12">
    <h2 class="text-2xl mb-4">👼 the snake has blessed you with {picks.length} picks 🙏</h2>
    <ul class="w-full max-w-xl flex flex-wrap justify-center mx-auto text-lg">	
      {#each picks as pick}
      <li class="inline m-1">#{pick}</li>
      {/each}
    </ul>

    <div class="my-12">
      <h2 class="text-2xl italic uppercase">what does this mean !?!?</h2>
      <p class="max-w-lg my-6 mx-auto text-center">
        you'll wait for <b>{picks[0]-1}</b> picks<br>
        and then <b>{picks[1]-picks[0]-1}</b> picks<br>
        and then <b>{picks[2]-picks[1]-1}</b> picks<br>
        followed by <b>{picks[3]-picks[2]-1}</b> picks<br>
        and another <b>{picks[4]-picks[3]-1}</b> picks<br>
        then <b>{picks[5]-picks[4]-1}</b> picks<br>
        and so on and so on.</p>
    </div>

    <div class="my-20">
      {#each matrix as round, roundIdx}
        <div class="mx-auto text-center w-full">
          <div class="w-full flex justify-center my-2">
            <div class="bg-black text-white border-black font-mono [writing-mode:vertical-rl] transform rotate-180 py-2 px-1 mr-2 text-center text-xs rounded-lg">round {roundIdx+1}</div>
            <div class="inline-flex flex-wrap gap-2">
              {#each matrix[roundIdx] as teamNum, pickIdx}
                <div class="flex flex-wrap drop-shadow-sm p-1 w-16 items-center rounded-lg" class:bg-[var(--activeColor)]={teamNum==myDraftOrderNumber} class:text-white={teamNum==myDraftOrderNumber && tinycolor(activeColor).isDark()} class:bg-white={teamNum!=myDraftOrderNumber}>
                  <div class="text-xs basis-full">team {teamNum}</div>
                  <div class="text-xl basis-full">#{overallPickNumber(roundIdx, pickIdx)}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
      </div>
  </section>
</main>
