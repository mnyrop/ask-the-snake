<script>

  import { page } from "$app/stores"
  import { goto } from "$app/navigation"
  import { browser } from '$app/environment';
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { tick } from "svelte"
  import { updated } from "$app/stores"
  import { players } from "../lib/players.js"

  import tinycolor from "tinycolor2"
  import "../app.css"


  let numTeams            = 12
  let rosterSize          = 16
  let myDraftOrderNumber  = 10
  let activeColor         = "#66D049"
  

  // On mount, initialize from query params if present
  onMount(() => {
    const params = get(page).url.searchParams;
    numTeams = +(params.get('numTeams') ?? numTeams);
    rosterSize = +(params.get('rosterSize') ?? rosterSize);
    myDraftOrderNumber = +(params.get('myDraftOrderNumber') ?? myDraftOrderNumber);
    activeColor = params.get('activeColor') ?? activeColor;
  });

  $: matrix  = snakeMatrix(numTeams, rosterSize, myDraftOrderNumber)
  $: picks   = draftPicks(matrix, myDraftOrderNumber)

  // Update query params when any variable changes
  $: updateQueryParams(numTeams, rosterSize, myDraftOrderNumber, activeColor)
  let lastParams = ""
  async function updateQueryParams(numTeams, rosterSize, myDraftOrderNumber, activeColor) {
    // Avoid running on first load before onMount
    await tick();
    const params = new URLSearchParams({
      numTeams: String(numTeams),
      rosterSize: String(rosterSize),
      myDraftOrderNumber: String(myDraftOrderNumber),
      activeColor: String(activeColor)
    });
    const paramStr = params.toString();
    if (paramStr !== lastParams) {
      lastParams = paramStr;
      if (browser) {
        goto(`?${paramStr}`, { replaceState: true, keepfocus: true, noScroll: true });
      }
    }
  }

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
    let idx           = 0
    let allPicks      = matrix.flat()
    let myDraftPicks  = []

    while (idx < allPicks.length) {
      let teamNum = allPicks[idx]
      if (teamNum == myDraftOrderNumber) { 
        myDraftPicks.push(idx+1)
      }
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

  let playerImgSrc = 'https://imgs.search.brave.com/1OqZBIizFBOvbuKzcU98Z9NLxJgY5cG2F2kD7c-Nc2E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1LzEyLzE2Lzcw/LzM2MF9GXzUxMjE2/NzA3Ml90ZnRlOUVs/R3k0RFN5YUlSdFJv/T3RMY0RlN0xJb3Q0/Yy5qcGc';
  let playerLink = null;
  let playerNameString = 'Could be anyone';

  function showPlayerForPick(pickNum) {
    const player = players.find(p => Number(p.rank) === Number(pickNum));
    console.log("player", player);
    if (player && player.espnID) {
      playerImgSrc = `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${player.espnID}.png&w=350&h=254`;
      playerLink = `https://www.espn.com/nfl/player/_/id/${player.espnID}/`;
      playerNameString = `#${pickNum} could be ${player.player.replace(/S/g, 'Sss').replace(/s/g, 'sss')}`;
    }
    else {
      playerImgSrc = 'https://imgs.search.brave.com/1OqZBIizFBOvbuKzcU98Z9NLxJgY5cG2F2kD7c-Nc2E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1LzEyLzE2Lzcw/LzM2MF9GXzUxMjE2/NzA3Ml90ZnRlOUVs/R3k0RFN5YUlSdFJv/T3RMY0RlN0xJb3Q0/Yy5qcGc';
      playerNameString = `#${pickNum} could be anyone`;
      playerLink = null;
    }
  }
</script>

<main class="flex flex-row flex-wrap md:flex-nowrap w-full h-dvh" style="--activeColor: {activeColor}; --lightSafeActiveColor: {darkerIfNeeded(activeColor)}">
  <section class="basis-full md:basis-1/3 p-6">
    <header>
      <h1 class="mb-2 text-5xl text-[var(--lightSafeActiveColor)] [text-shadow:_0_2px_0_rgb(0_0_0_)]">O, GREAT SNAKE...</h1>
      <h2 class="mb-10 text-4xl text-[var(--lightSafeActiveColor)] [text-shadow:_0_2px_0_rgb(0_0_0_)]">WHEN WILL I DRAFT??</h2>
    </header>

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
        <input type="color" id="favcolor" name="favcolor" bind:value={activeColor} class="basis-1/3 font-mono rounded-r-lg border border-black text-right px-2 h-[2.15rem] bg-white focus:outline-none">
      </div>

      <!-- <input type="submit" value="When will I draft?" class="bg-[var(--lightSafeActiveColor)] cursor-pointer rounded-lg shadow-lg hover:shadow-md px-2 h-[2.15rem]"/> -->
    </form>
  </section>

  <section class="basis-full md:h-dvh md:overflow-y-scroll md:basis-2/3 p-6">
    <div class="flex flex-row">
      <div>
        <h2 class="text-2xl mb-4 bg-white bg-opacity-55" style="font-family:cursive">i blesssss you with {picks.length} pickssss at...</h2>
        <ul class="w-full max-w-xl flex flex-wrap text-lg bg-white bg-opacity-55">
          {#each picks as pick}
          <li class="inline m-1 font-bold"
              on:click={() => showPlayerForPick(pick)}>
            <div class="text-[var(--lightSafeActiveColor)] underline hover:no-underline cursor-pointer">#{pick}</div>
          </li>
          {/each}
        </ul>

        <div id="playerContainer" class="my-4 bg-white bg-opacity-55 rounded-lg flex items-center justify-center">
          {#if playerImgSrc}
            <!-- svelte-ignore a11y-img-redundant-alt -->
             <a target="_blank" href="{playerLink}">
              <p style="font-family:cursive">{playerNameString}</p>
              <img id="playerImg" src={playerImgSrc} alt="Player image" class="w-48" />
            </a>
          {/if}
        </div>
   
        <div class="my-12">
          <h2 class="text-2xl italic bg-white bg-opacity-55" style="font-family:cursive">thisss meanssssss...</h2>
          <p class="max-w-lg my-6 italic bg-white bg-opacity-55 rounded-lg">
            you'll wait for <b>{picks[0]-1} picksss</b>... <span class="font-bold text-[var(--lightSafeActiveColor)]">draft</span> ...
            and then wait <b>{picks[1]-picks[0]-1} picksss</b>... <span class="font-bold text-[var(--lightSafeActiveColor)]">draft</span> ...
            and then wait <b>{picks[2]-picks[1]-1} picksss</b>... <span class="font-bold text-[var(--lightSafeActiveColor)]">draft</span> ...
            followed by <b>{picks[3]-picks[2]-1} picksss</b>... <span class="font-bold text-[var(--lightSafeActiveColor)]">draft</span> ...
            and another <b>{picks[4]-picks[3]-1} picksss</b>... <span class="font-bold text-[var(--lightSafeActiveColor)]">draft</span> ...
            then wait <b>{picks[5]-picks[4]-1} picksss</b>...
            and ssso on and ssso on for {rosterSize} roundsss.</p>
        </div>
      </div>
    </div>

    <div class="my-20">
      {#each matrix as round, roundIdx}
        <div class="w-full">
          <div class="w-full flex my-2">
            <div class="bg-black text-white border-black font-mono [writing-mode:vertical-rl] transform rotate-180 py-2 px-1 mr-2 text-xs rounded-lg">round {roundIdx+1}</div>
            <div class="inline-flex flex-wrap gap-1">
              {#each matrix[roundIdx] as teamNum, pickIdx}
                <div class="flex flex-wrap drop-shadow-sm p-1 w-16 items-center rounded-lg" class:bg-[var(--activeColor)]={teamNum==myDraftOrderNumber} class:text-white={teamNum==myDraftOrderNumber && tinycolor(activeColor).isDark()} class:bg-white={teamNum!=myDraftOrderNumber}>
                  {#if teamNum == myDraftOrderNumber}
                    <div class="text-xs basis-full italic">YOUUU</div>
                  {:else}
                    <div class="text-xs basis-full">team {teamNum}</div>
                  {/if}
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
