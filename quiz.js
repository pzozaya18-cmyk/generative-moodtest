// ================================
// quiz.js — UI → params ONLY
// ================================

window.params = {
  word: '',
  emotions: [''],
  battery: 'Mid',
  productivity: 'Moderate',
  distraction: 'Social media / phone',
  energy: 'High all day',
  health: 'Exercised and ate healthy',
  organization: 'Extremely organized',
  animate: true
}

const emotionList = [
  'Joy','Passion','Love','Hopefulness','Peaceful',
  'Boredom','Rigid','Frustration','Overwhelmed','Disappointed','Doubt',
  'Worry', 'Stress','Anxiety','Discouragement','Anger','Hatred','Jealousy','Insecurity','Fear'
]

document.getElementById('generate').onclick = () => {

  const emotions = emotionList.filter(e =>
    document.getElementById(`emotion-${e}`)?.checked
  )

  window.params = {
    ...window.params,
    emotions: emotions.length ? emotions : ['Boredom'],
    battery: document.getElementById('battery').value,
    productivity: document.getElementById('productivity').value,
    distraction: document.getElementById('distraction').value,
    energy: document.getElementById('energy').value,
    health: document.getElementById('health').value,
    organization: document.getElementById('organization').value,
    word: document
      .getElementById('word')
      .value
      .toUpperCase()
      .replace(/[^A-Z]/g,'')
      .slice(0,18)
  }
  const scores = calculateFontScores(window.params)
  console.table(scores)
  const chosenFont = pickFont(scores)
  window.params.fontName = chosenFont
if (window.setFontMode) window.setFontMode(chosenFont)

  redraw()
}

document.getElementById('download').onclick = () => {
  saveCanvas('expressive-type','png')
}

const FONT_RULES = {
  Pulse: {
    emotions: ['Joy','Passion','Enthusiasm','Hopefulness'],
    productivity: ['Moderate'],
    distraction: ['Social media / phone', 'Socializing'],
    battery: ['Full'],
    energy: ['Good with a dip'],
    health: ['Planned recovery day'],
    organization: ['Chaos'],
    base: 0
  },
  Drift: {
    emotions: ['Peaceful','Contentment','Boredom'],
    productivity: ['Bare minimum'],
    distraction: ['Lack of focus'],
    battery: ['Low'],
    energy: ['Low'],
    health: ['Failed to excercise or eat healthy'],
    organization: ['Mildly messy'],
    base: 0
  },
  Armor: {
    emotions: ['Doubt','Fear','Anger','Insecurity'],
    productivity: ['Solid productivity'],
    distraction: ['Procrastination'],
    battery: ['Empty'],
    energy: ['Exhausted'],
    health: ['Did one of the two above'],
    organization: ['Prepared with some tidying to do'],
    base: 0
  },
  Drive: {
    emotions: ['Passion','Frustration'],
    productivity: ['Super productive'],
    distraction: ['Unexpected tasks'],
    battery: ['Mid'],
    energy: ['High all day'],
    health: ['Exercised and ate healthy'],
    organization: ['Extremely organized'],
    base: 0
  }
  }

function calculateFontScores(state) {
  const scores = {}

  Object.keys(FONT_RULES).forEach(font => {
    let score = FONT_RULES[font].base

    state.emotions.forEach(e => {
      if (FONT_RULES[font].emotions?.includes(e)) score += 2
    })
    if (FONT_RULES[font].productivity?.includes(state.productivity)) score += 2
    if (FONT_RULES[font].distraction?.includes(state.distraction)) score += 1
    if (FONT_RULES[font].battery?.includes(state.battery)) score += 2
    if (FONT_RULES[font].energy?.includes(state.energy)) score += 1
    if (FONT_RULES[font].organization?.includes(state.organization)) score += 1
    if (FONT_RULES[font].health?.includes(state.health)) score += 1

    scores[font] = score
  })

  return scores
}

function pickFont(scores) {
  return Object.entries(scores)
    .sort((a,b) => b[1] - a[1])[0][0]
}
