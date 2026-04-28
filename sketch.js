// ===============================
// Expressive Type — sketch.js
// STABLE VERSION
// Black fill, emotion-driven stroke
// ===============================


let glyphCache = {}
let currentWord = ''


let currentEmotions = []
let currentBattery = 'Empty'
let currentEnergy = 'Low'
let currentHealth = ''
let currentOrganization = ''
let tailMode = 0




let animOn = false
let freezeFrame = false
let t = 0
let pathSeedX
let pathSeedY


let pathLength = 1


const CANVAS_W = 1500
const CANVAS_H = 1080


let fonts = {}
let font
let currentFontName = 'Armor'


const WORD_MARGIN = 0.7
const SAFE_MARGIN = 0.12




window.setFontMode = function(name) {
  currentFontName = name
  if (fonts && fonts[name]) {
    font = fonts[name]
    textFont(font)
  }
  redraw()
}


let ready = false


let repeatCount = 32
let pinchStrength = 0.8
let pinchCenter
let baselineOffsets = []




// -------------------------------
// COLORS
// -------------------------------
const EMOTION_COLORS = {
  Joy: '#ffd84a',
  Passion: '#eb248e',
  Love: '#f35ed0',
  Hopefulness: '#29d4f3',
  Peaceful: '#9e95fd',
  Boredom: '#ffffff',
  Rigid: '#002fff',
  Frustration: '#ff416a',
  Overwhelmed: '#5021be',
  Disappointed: '#6d6d6d',
  Doubt: '#9cfd41',
  Worry: '#5d31fe',
  Stress: '#ffa600',
  Anxiety: '#ff5900',
  Anger: '#d11204',
  Hatred: '#8b0000',
  Jealousy: '#1fa504',
  Insecurity: '#0a8ad5',
  Fear: '#d1ff04'
}


function getEmotionStroke() {
  if (!currentEmotions || currentEmotions.length === 0) return '#ffffff'
  return EMOTION_COLORS[currentEmotions[0]] || '#ffffff'
}


// -------------------------------
// PRELOAD
// -------------------------------
function preload() {
  fonts.Armor = loadFont('fonts/Armor/Armor.ttf')
  fonts.Drift = loadFont('fonts/Drift/drift.ttf')
  fonts.Drive = loadFont('fonts/Drive/drive.ttf')
  fonts.Pulse = loadFont('fonts/Pulse/Pulse.ttf')
}


// -------------------------------
// SETUP
// -------------------------------
function setup() {
  const c = createCanvas(CANVAS_W, CANVAS_H)
  c.parent('canvas-wrap')
  angleMode(RADIANS)


  pinchCenter = createVector(width / 2, height / 2)
  pathSeedX = random(1000)
  pathSeedY = random(2000)




  readQuiz()
  computeBaselineOffsets(currentWord)
  selectFont()
font = fonts[currentFontName] || fonts.Armor
textFont(font)


  textFont(font)


  document.getElementById('animateToggle').addEventListener('change', e => {
    animOn = e.target.checked
    animOn ? loop() : noLoop()
  })


  document.getElementById('generate').addEventListener('click', () => {
    computeBaselineOffsets(currentWord)
    readQuiz()
    tailMode = floor(random(3))
    selectFont()
font = fonts[currentFontName] || fonts.Armor
textFont(font)




    textFont(font)
    glyphCache = {}
    t = 0
    redraw()
    if (animOn) loop()
  })


  ready = true
  loop()
}


// -------------------------------
// DRAW
// -------------------------------
function draw() {
  if (!ready) return
  if (!currentWord || currentWord.length === 0) return


  background(0)


  if (animOn && !freezeFrame) t += 0.016
  renderType(t)
}


// -------------------------------
// RENDER TYPE
// -------------------------------
function renderType(time) {
  push()
  translate(width / 2, height / 2)


  if (currentEnergy === 'High all day') pinchStrength = 0.3
  if (currentEnergy === 'Good with a dip') pinchStrength = 0.6
  if (currentEnergy === 'Low') pinchStrength = 0.9
  if (currentEnergy === 'Exhausted') pinchStrength = 1.2


  // INVISIBLE HERO ANCHOR (not rendered)
  drawWarpedWord(time, 1, true)


  // TRAIL: draw far → near
for (let i = 0; i < repeatCount; i++) {
  let tNorm = i / repeatCount
  drawWarpedWord(time, tNorm)
}




  pop()
}






// -------------------------------
// WARPED WORD
// -------------------------------
function drawWarpedWord(time, tNorm, isHero = false) {
  push()


  let s = lerp(0.15, 1.35, pow(tNorm, 2.6))
  scale(s)


  let n = time - tNorm * pathLength


  let curveX = map(noise(pathSeedX + n), 0, 1, -width * 0.28, width * 0.28)
  let curveY = map(noise(pathSeedY + n), 0, 1, -height * 0.35, height * 0.35)


  curveX = constrain(curveX, -width * (0.5 - SAFE_MARGIN), width * (0.5 - SAFE_MARGIN))
  curveY = constrain(curveY, -height * (0.5 - SAFE_MARGIN), height * (0.5 - SAFE_MARGIN))


  translate(curveX * (1 - tNorm), (curveY + height * 0.1) * (1 - tNorm))


  let depth = map(tNorm, 0, 1, 0.4, 1)
  scale(depth)


  let pinchAmt = pinchStrength * (1 - tNorm)
  translate(
    (pinchCenter.x - width / 2) * pinchAmt,
    (pinchCenter.y - height / 2) * pinchAmt
  )


  if (!isHero) {
    drawWord(time, tNorm)
  }


  pop()
}




// -------------------------------
// WORD DRAW
// -------------------------------
function drawWord(time, tNorm) {
  let baseSize = mapEnergyToSize()
  let fontSize = fitWordToCanvas(baseSize)
  let spacing = fontSize * 0.65
  let lineHeight = fontSize * 1.2
  if (tNorm > 0.92) {
  fill(0)
} else {
  noFill()
}
  let c = getEmotionGradient(tNorm)
  c.setAlpha(map(tNorm, 0, 1, 40, 255))
  stroke(c)


  strokeWeight(
  mapHealthToStroke() * (tNorm === 1 ? 1.2 : pow(tNorm, 1.4))
)




  let lines = splitWordIntoLines(currentWord, fontSize)


  let totalHeight = (lines.length - 1) * lineHeight
  let maxHeight = height * WORD_MARGIN
  let clampedHeight = min(totalHeight, maxHeight)
  let yStart = -clampedHeight / 2




  for (let l = 0; l < lines.length; l++) {
    let line = lines[l]
    let lineWidth = line.length * spacing
    let x = -lineWidth / 2
    let y = yStart + l * lineHeight


    for (let i = 0; i < line.length; i++) {
      push()
      translate(x, y + (baselineOffsets[i] || 0))
      drawGlyph(line[i], fontSize, c)
      pop()
      x += spacing
    }
  }
}


function getEmotionGradient(tNorm) {
  if (!currentEmotions || currentEmotions.length === 0) {
    return color('#ffffff')
  }


  let cols = currentEmotions
    .map(e => color(EMOTION_COLORS[e]))
    .filter(c => c)
    .sort((a, b) => {
      let la = red(a) * 0.299 + green(a) * 0.587 + blue(a) * 0.114
      let lb = red(b) * 0.299 + green(b) * 0.587 + blue(b) * 0.114
      return lb - la
    })


  if (cols.length === 1) return cols[0]


  let idx = tNorm * (cols.length - 1)
  let i0 = floor(idx)
  let i1 = min(i0 + 1, cols.length - 1)
  let amt = idx - i0


  return lerpColor(cols[i0], cols[i1], amt)
}








// -------------------------------
// GLYPH
// -------------------------------
function drawGlyph(char, size, strokeCol) {
  let key = char + '_' + size
  if (!glyphCache[key]) {
    glyphCache[key] = font.textToPoints(char, 0, 0, size, {
      sampleFactor: 0.35,
      simplifyThreshold: 0
    })
  }


  let pts = glyphCache[key]
  if (!pts || pts.length === 0) return


  // --- FILL PASS ---
  noStroke()
  if (drawingContext.fillStyle !== 'rgba(0, 0, 0, 0)') fill(0)
 
  beginShape()
  for (let i = 0; i < pts.length; i++) {
    vertex(pts[i].x, pts[i].y)
  }
  endShape(CLOSE)


  // --- STROKE PASS ---
  noFill()
  stroke(strokeCol || getEmotionStroke())
  strokeWeight(mapHealthToStroke())


  beginShape()
  for (let i = 0; i < pts.length; i++) {
    vertex(pts[i].x, pts[i].y)
  }
  endShape(CLOSE)


}




// -------------------------------
// HELPERS
// -------------------------------
function selectFont() {
  if (currentBattery === 'Empty') {
    repeatCount = 25
    repeatSpacing = 1.1
    pathLength = 0.6
  }


  if (currentBattery === 'Low') {
    repeatCount = 120
    repeatSpacing = 1.1
    pathLength = 0.9
  }


  if (currentBattery === 'Mid') {
    repeatCount = 300
    repeatSpacing = 1.1
    pathLength = 4
  }


  if (currentBattery === 'Full') {
    repeatCount = 500
    repeatSpacing = 1.1
    pathLength = 6.0
  }
}




function computeBaselineOffsets(word) {
  baselineOffsets = []


  const org = window.params?.organization || 'Prepared with some tidying to do'


  let range = 0
  if (org === 'Extremely organized') range = 0
  if (org === 'Prepared with some tidying to do') range = 50
  if (org === 'Mildly messy') range = 150
  if (org === 'Chaos') range = 300


  for (let i = 0; i < word.length; i++) {
    baselineOffsets.push(random(-range, range))
  }
}



function mapEnergyToSize() {
  return {
    'High all day': 160,
    'Good with a dip': 140,
    'Low': 120,
    'Exhausted': 100
  }[currentEnergy] || 100
}


function mapHealthToStroke() {
  return {
    'Exercised and ate healthy': 4,
    'Did one of the two above': 3,
    'Planned recovery day': 2,
    'Failed to excercise or eat healthy': 1
  }[currentHealth] || 4
}


function fitWordToCanvas(baseSize) {
  let spacingFactor = 0.65
  let usableWidth = width * 0.9
  let total = currentWord.length * baseSize * spacingFactor
  if (total <= usableWidth) return baseSize
  return baseSize * (usableWidth / total)
}


function splitWordIntoLines(word, fontSize) {
  return [word]
}








function readQuiz() {
  currentWord = document.getElementById('word').value.toUpperCase()
  currentBattery = document.getElementById('battery').value
  currentProductivity = document.getElementById('productivity').value
  biggestDistraction = document.getElementById('distraction').value
  currentEnergy = document.getElementById('energy').value
  currentHealth = document.getElementById('health').value
  currentOrganization = document.getElementById('organization').value


  currentEmotions = []
  document.querySelectorAll('.emotions input:checked').forEach(e => {
    currentEmotions.push(e.id.replace('emotion-', ''))
 
  console.log({
  emotions: currentEmotions,
  battery: currentBattery,
  productivity: currentProductivity,
  distraction: biggestDistraction,
  energy: currentEnergy,
  health: currentHealth,
  organization: currentOrganization,
  mood: getMood()
})


 
  })
}




function getMood() {
  
  let score = {
    Drift: 0,
    Drive: 0,
    Pulse: 0,
    Armor: 0
    
  }
  
  console.log('MOOD SCORES', score)


  currentEmotions.forEach(e => {
    if (['Joy','Enthusiasm','Love'].includes(e)) score.Pulse += 2
    if (['Hopefulness','Peaceful'].includes(e)) score.Drift += 2
    if (e === 'Passion') { score.Pulse++; score.Drive++ }
    if (['Frustration','Anger','Stress'].includes(e)) score.Armor += 2
    if (['Doubt','Worry','Anxiety'].includes(e)) { score.Armor++; score.Drift++ }
    if (e === 'Boredom') score.Drift++
  })


  if (currentBattery === 'Empty') score.Armor += 1
  if (currentBattery === 'Low') score.Drift += 1
  if (currentBattery === 'Mid') score.Drive += 1
  if (currentBattery === 'Full') score.Pulse += 2


  if (currentProductivity === 'Bare minimum') score.Drift += 1
  if (currentProductivity === 'Moderate') score.Pulse += 1
  if (currentProductivity === 'Solid productivity') score.Armor += 2
  if (currentProductivity === 'Very productive') score.Drive += 3


  if (biggestDistraction === 'Social media / phone') score.Pulse += 2
  if (biggestDistraction === 'Procrastination') score.Armor += 1
  if (biggestDistraction === 'Unexpected tasks') score.Drive += 1
  if (biggestDistraction === 'Lack of focus') score.Drift += 2
  if (biggestDistraction === 'Socializing') score.Pulse += 3


  if (currentEnergy === 'Exhausted') score.Drift += 2
  if (currentEnergy === 'Low') score.Drift += 1
  if (currentEnergy === 'Good with a dip') score.Pulse += 1
  if (currentEnergy === 'High all day') { score.Drive += 2; score.Pulse += 1 }


  if (currentHealth === 'Exercised and ate healthy') score.Drive += 2
  if (currentHealth === 'Did one of the two above') score.Armor += 1
  if (currentHealth === 'Planned recovery day') score.Pulse += 1
  if (currentHealth === 'Failed to excercise or eat healthy') score.Drift += 1


  if (currentOrganization === 'Extremely organized') score.Drive += 2
  if (currentOrganization === 'Prepared with some tidying to do') score.Armor += 1
  if (currentOrganization === 'Mildly messy') score.Drift += 1
  if (currentOrganization === 'Chaos') score.Pulse += 1


  return Object.entries(score)
  .sort((a, b) => b[1] - a[1])[0][0]


  
}


