import { PuzzleVaultEntry } from './puzzle-vault-entry.model';

export const PUZZLE_VAULT_ENTRIES: PuzzleVaultEntry[] = [
  // --- Measuring / jug puzzles ---
  {
    id: 'measuring-1',
    category: 'measuring',
    difficulty: 1,
    prompt:
      'You have an empty 3-liter jug and an empty 5-liter jug, plus a tap with unlimited water. How can you measure out exactly 4 liters?',
    hints: [
      'You can fill a jug all the way, empty it completely, or pour from one jug into the other until either the first is empty or the second is full.',
      'Try filling the 5-liter jug first, then pouring it into the 3-liter jug.',
      'After that pour, the 5-liter jug has 2 liters left. What happens if you empty the 3-liter jug and pour that 2 liters into it?',
    ],
    solution:
      'Fill the 5L jug. Pour it into the 3L jug (5L jug now has 2L). Empty the 3L jug. Pour the 2L into the 3L jug. Fill the 5L jug again. Pour from the 5L jug into the 3L jug until the 3L jug is full (it only needs 1 more liter) — the 5L jug now has exactly 4L left.',
    explanation:
      'The trick is using the smaller jug to "remember" a leftover amount (2L) so you can subtract it from a full jug later. Jug puzzles are really about tracking remainders, not just filling and pouring randomly.',
  },
  {
    id: 'measuring-2',
    category: 'measuring',
    difficulty: 2,
    prompt:
      'Using the same 3-liter and 5-liter jugs, how can you measure out exactly 1 liter?',
    hints: [
      'Start by filling the 3-liter jug and pouring it into the 5-liter jug.',
      'Fill the 3-liter jug a second time.',
      'Pour from the full 3-liter jug into the 5-liter jug until the 5-liter jug is completely full — how much is left in the 3-liter jug?',
    ],
    solution:
      'Fill the 3L jug and pour it into the 5L jug (5L jug now has 3L). Fill the 3L jug again. Pour from it into the 5L jug until the 5L jug is full — it only needs 2 more liters, so the 3L jug is left with exactly 1L.',
    explanation:
      'This is the same two jugs as before, but a different target shows there can be more than one useful "leftover" you can create depending on which jug you fill and pour first.',
  },
  {
    id: 'measuring-3',
    category: 'measuring',
    difficulty: 3,
    prompt:
      'You have an empty 4-liter jug and an empty 7-liter jug. How can you measure out exactly 6 liters?',
    hints: [
      'Filling and pouring back and forth a couple of times, you can create small leftover amounts — try to make a leftover of 3 liters first.',
      'Fill the 7-liter jug, then pour into the 4-liter jug. Empty the 4-liter jug, and pour the 7-liter jug\'s leftover into it.',
      'Now fill the 7-liter jug again and top up the 4-liter jug until it\'s full. How much is left in the 7-liter jug?',
    ],
    solution:
      'Fill the 7L jug, pour into the 4L jug (7L jug has 3L left, 4L jug full). Empty the 4L jug. Pour the 3L into the 4L jug. Fill the 7L jug again. Pour from it into the 4L jug until full — it only needs 1 more liter, leaving exactly 6L in the 7L jug.',
    explanation:
      'Notice the pattern: each round trip lets you shave off a smaller and smaller amount (7→3→6) until you land exactly on the target. Bigger jug sizes just mean more rounds of the same idea.',
  },
  {
    id: 'measuring-4',
    category: 'measuring',
    difficulty: 4,
    prompt:
      'You have an empty 3-liter jug and an empty 8-liter jug. How can you measure out exactly 4 liters?',
    hints: [
      'This one takes more back-and-forth pours than the others — try filling the 3-liter jug and emptying it into the 8-liter jug, twice in a row.',
      'After two rounds, the 8-liter jug should have 6 liters and the 3-liter jug will only be able to take 2 more liters before it\'s full — what does that leave in the 3-liter jug?',
      'Empty the 8-liter jug completely, pour in whatever is left in the 3-liter jug, then fill the 3-liter jug one more time and pour it all in.',
    ],
    solution:
      'Fill the 3L jug and pour into the 8L jug, twice (8L jug now has 6L, since the second pour only partially fits — actually track carefully: after filling/pouring twice, 8L jug has 6L and 3L jug is empty). Fill the 3L jug a third time and pour into the 8L jug — it only takes 2 more liters before being full, leaving 1L in the 3L jug. Empty the 8L jug completely. Pour that 1L into it. Fill the 3L jug once more and pour it all in: 1L + 3L = exactly 4L.',
    explanation:
      'With jug sizes that don\'t divide evenly into each other, you sometimes need several rounds before a useful leftover appears — here it took until the third fill of the small jug to get a 1-liter remainder to build on.',
  },
  {
    id: 'measuring-5',
    category: 'measuring',
    difficulty: 5,
    prompt:
      'You have an empty 5-liter jug and an empty 7-liter jug. How can you measure out exactly 6 liters?',
    hints: [
      'Start by filling the 7-liter jug and pouring into the 5-liter jug — that leaves a small amount in the 7-liter jug.',
      'Empty the 5-liter jug, move that small leftover into it, then fill the 7-liter jug again and top up the 5-liter jug.',
      'Repeat the "empty the small jug, transfer the leftover, refill the big jug, top up" pattern one more time — watch the leftover grow by the same amount each round.',
    ],
    solution:
      'Fill 7L, pour into 5L (7L has 2L left). Empty 5L, pour the 2L in. Fill 7L again, top up 5L until full (needs 3L, so 7L has 4L left). Empty 5L, pour the 4L in. Fill 7L again, top up 5L until full (needs 1L, so 7L has exactly 6L left).',
    explanation:
      'This is the longest chain in the set — eight pours in total — but it\'s built from exactly the same two moves repeated: create a leftover, then use it to "reset" the small jug so the next leftover is bigger.',
  },

  // --- River-crossing puzzles ---
  {
    id: 'crossing-1',
    category: 'crossing',
    difficulty: 1,
    prompt:
      'A farmer needs to cross a river with a wolf, a goat, and a cabbage. The boat only fits the farmer plus one other thing. If left alone together, the wolf will eat the goat, and the goat will eat the cabbage. How does everyone cross safely?',
    hints: [
      'Think about which thing is safe to leave with which other thing — the wolf and the cabbage are actually fine left alone together.',
      'Start by taking the goat across, since it\'s the one that causes trouble with both the others.',
      'After dropping off the goat, you\'ll need to bring something back across at least once before you\'re done.',
    ],
    solution:
      'Take the goat across, leave it, and go back alone. Take the wolf across, but bring the goat back with you. Leave the goat behind and take the cabbage across. Go back alone for the goat, and take it across one last time.',
    explanation:
      'The key insight is that the goat is the "dangerous" item to both the others, so it has to be shuttled back and forth while the wolf and cabbage — which are safe together — wait their turn.',
  },
  {
    id: 'crossing-2',
    category: 'crossing',
    difficulty: 2,
    prompt:
      'Two adults and two children need to cross a river. Their boat holds either one adult, or up to two children, but not an adult and a child together. How does everyone get across?',
    hints: [
      'Only children can bring the boat back across without an adult, since the boat can\'t carry an adult and a child together — so a child often ends up "ferrying" the boat back.',
      'Start by sending both children across, then bring just one of them back.',
      'With one child back on the starting side, an adult can now cross — but who brings the boat back for the next adult?',
    ],
    solution:
      'Both children cross. One child returns. One adult crosses. The child who was already on the far side returns (so now both children are back on the start side). Both children cross again. One child returns. The second adult crosses. The remaining child on the far side returns one last time. Both children cross together to finish.',
    explanation:
      'Every time an adult needs to cross, you first need a child waiting on the starting side to bring the boat back afterward — so the children end up doing a lot of shuttling while the adults each get exactly one one-way trip.',
  },
  {
    id: 'crossing-3',
    category: 'crossing',
    difficulty: 3,
    prompt:
      'Four people need to cross a rickety bridge at night with one flashlight. The bridge only holds 2 people at a time, and anyone crossing must carry the flashlight (it can\'t be thrown or left behind). The four people take 1, 2, 5, and 8 minutes to cross respectively, and a pair walks at the slower person\'s pace. What is the fastest everyone can get across?',
    hints: [
      'Sending the two slowest people across separately wastes time — try to get them across together in one trip.',
      'Before the two slowest can cross together, someone fast needs to bring the flashlight back to them — and after they cross, someone fast needs to be waiting on the far side already, or the flashlight has to come back again.',
      'Try: the two fastest cross first, the fastest returns alone, then the two slowest cross together, then the other fast person returns, then the two fastest cross again.',
    ],
    solution:
      'The 1-minute and 2-minute person cross together (2 min). The 1-minute person returns (1 min, total 3). The 5-minute and 8-minute person cross together (8 min, total 11). The 2-minute person returns (2 min, total 13). The 1-minute and 2-minute person cross together again (2 min, total 15). Total: 15 minutes.',
    explanation:
      'The slowest two people are the real cost, so the goal is to get them across in a single trip together rather than separately, even though that means some extra back-and-forth trips for the two fastest people.',
  },
  {
    id: 'crossing-4',
    category: 'crossing',
    difficulty: 4,
    prompt:
      'Same bridge and flashlight rules as before, but now the four people take 1, 2, 7, and 10 minutes to cross. What is the fastest everyone can get across?',
    hints: [
      'The same overall strategy works as last time — get the two slowest across together in one trip.',
      'Use the two fastest people as the "flashlight runners" who shuttle back and forth.',
      'Add up: two fastest cross, fastest returns, two slowest cross together, second-fastest returns, two fastest cross again.',
    ],
    solution:
      'The 1-minute and 2-minute person cross together (2 min). The 1-minute person returns (1 min, total 3). The 7-minute and 10-minute person cross together (10 min, total 13). The 2-minute person returns (2 min, total 15). The 1-minute and 2-minute person cross together again (2 min, total 17). Total: 17 minutes.',
    explanation:
      'With bigger gaps between the slow and fast times, the same "shuttle" strategy still wins — the cost is dominated by the single trip the two slowest people make together, plus a fixed amount of back-and-forth from the two fastest.',
  },
  {
    id: 'crossing-5',
    category: 'crossing',
    difficulty: 5,
    prompt:
      'Three missionaries and three cannibals need to cross a river in a boat that holds at most 2 people. On no bank can cannibals ever outnumber missionaries (if any missionaries are there at all) — otherwise the missionaries are in trouble! How does everyone cross safely?',
    hints: [
      'Start by shuttling cannibals across, since a bank with zero missionaries is always safe no matter how many cannibals are on it.',
      'Once two cannibals are safely on the far side and the boat is back on the near side, you can start carefully moving missionaries — but watch out for moments where you create an unsafe ratio.',
      'A useful pattern: move 2 cannibals across, return 1; repeat; then once one side is missionary-only-safe, move missionaries across 2 at a time, returning 1 missionary+1 cannibal pair when needed to keep both banks safe.',
    ],
    solution:
      'Send 2 cannibals across, 1 returns. Send 2 cannibals across, 1 returns. Send 2 missionaries across, 1 missionary+1 cannibal returns. Send 2 missionaries across, 1 cannibal returns. Send 2 cannibals across, 1 returns. Send 2 cannibals across. Everyone is now on the far side, in 11 one-way trips.',
    explanation:
      'The hardest part is the middle section, where you briefly have to bring someone backward to avoid an unsafe moment — it feels like losing progress, but it\'s necessary to keep both banks safe at every single step along the way, not just at the start and end.',
  },

  // --- Weighing / balance puzzles ---
  {
    id: 'weighing-1',
    category: 'weighing',
    difficulty: 1,
    prompt:
      'You have 2 identical-looking coins, but one is heavier than the other. Using a balance scale just once, how do you find the heavier coin?',
    hints: ['Put one coin on each side of the balance scale.'],
    solution: 'Place one coin on each side of the scale — the side that tips down holds the heavier coin.',
    explanation:
      'A balance scale doesn\'t tell you weight directly — it only tells you which side is heavier. That\'s the core idea behind every puzzle in this category.',
  },
  {
    id: 'weighing-2',
    category: 'weighing',
    difficulty: 2,
    prompt:
      'You have 9 coins that all look identical, but one is heavier than the rest (which all weigh exactly the same). Using a balance scale only twice, how do you find the heavier coin?',
    hints: [
      'Split the 9 coins into 3 equal groups of 3, and weigh two of the groups against each other.',
      'If the two groups balance, the heavy coin must be in the group you didn\'t weigh. If they don\'t balance, it\'s in whichever group of 3 was heavier.',
      'Now you have 3 coins and one of them is heavy — weigh 2 of those 3 against each other for your second weighing.',
    ],
    solution:
      'Split into 3 groups of 3 and weigh group A against group B. If they balance, the heavy coin is in group C; otherwise it\'s in whichever group was heavier. Take that group of 3, weigh one coin against another: if they balance, the heavy coin is the third one you set aside; otherwise it\'s the heavier one on the scale.',
    explanation:
      'Splitting into 3 equal groups (not 2!) is what makes this work in only 2 weighings — each weighing eliminates two-thirds of the suspects at once, which is the fastest a balance scale can narrow things down.',
  },
  {
    id: 'weighing-3',
    category: 'weighing',
    difficulty: 3,
    prompt:
      'Same as before, but now you have 8 coins, and one is heavier than the rest. Using a balance scale only twice, how do you find it?',
    hints: [
      'You can\'t split 8 into 3 perfectly equal groups — try groups of 3, 3, and 2 instead.',
      'Weigh the two groups of 3 against each other first.',
      'If those two balance, the heavy coin is one of the leftover 2 — weigh those two directly for your second weighing. If they don\'t balance, take the heavier group of 3 and weigh 2 of those 3 against each other.',
    ],
    solution:
      'Split into groups of 3, 3, and 2. Weigh the two groups of 3 against each other. If they balance, the heavy coin is one of the 2 leftover coins — weigh those two against each other to find it. If they don\'t balance, take the heavier group of 3, weigh one coin against another from it: if they balance, the heavy coin is the third (unweighed) one; otherwise it\'s whichever was heavier on the scale.',
    explanation:
      'Uneven splits are trickier because the two paths (groups balance vs. don\'t balance) lead to different-sized next steps — but as long as each weighing has 3 roughly-equal possible outcomes, you can still solve it in the same number of weighings.',
  },
  {
    id: 'weighing-4',
    category: 'weighing',
    difficulty: 4,
    prompt:
      'You have 3 bags of coins. All coins look identical, but every coin in one particular bag is 1 gram heavier than coins in the other two bags (which are all the same normal weight). Using a scale that shows an exact weight in grams, how can you find the heavy bag using only ONE weighing?',
    hints: [
      'You\'re allowed to take a different number of coins from each bag for this single weighing.',
      'Try taking 1 coin from bag A, 2 coins from bag B, and 3 coins from bag C, and weigh all 6 together at once.',
      'Figure out what the total weight WOULD be if every coin were normal weight, then see how far over that the real weighing is.',
    ],
    solution:
      'Take 1 coin from bag A, 2 from bag B, and 3 from bag C, and weigh all 6 together. Work out the expected weight if every coin were normal. The actual weight will be exactly 1, 2, or 3 grams over that — and that number tells you directly whether bag A, B, or C is the heavy one.',
    explanation:
      'Instead of comparing weights against each other like a balance scale, this uses a scale that gives an exact number — so you can design the test so each bag leaves a different, recognizable "fingerprint" of extra grams.',
  },
  {
    id: 'weighing-5',
    category: 'weighing',
    difficulty: 5,
    prompt:
      'You have 12 coins that all look identical. Exactly one of them is fake, and it\'s either slightly heavier OR slightly lighter than the real coins — but you don\'t know which. Using a balance scale only 3 times, how can you find the fake coin AND figure out whether it\'s heavier or lighter?',
    hints: [
      'Split the coins into 3 groups of 4 for your first weighing, and weigh two of the groups against each other.',
      'Whatever the result, you\'ll always be left with a smaller set of "suspect" coins, and importantly — you\'ll often know whether the fake one (if it\'s in that set) would be heavier or lighter.',
      'The trick that makes this solvable: in later weighings, mix in some coins you already know are genuine, so a balanced result is still useful information rather than a dead end.',
    ],
    solution:
      'This one is more about the strategy than a single short answer: each weighing should always split the remaining suspect coins into 3 roughly-equal-sized possibilities (heavier, lighter, or "not in this group"). Done carefully — including weighing some known-genuine coins alongside suspects — 3 weighings are always enough to identify the fake coin and tell whether it is heavy or light. This is one of the most famous puzzles of its kind; if you want the full step-by-step case breakdown, it\'s worth looking up "12 coins puzzle" once you\'ve given it a real attempt yourself.',
    explanation:
      'This is the classic "hardest" version of the balance-scale puzzle. Unlike the easier versions, you don\'t know in advance whether the fake is heavier or lighter, which doubles the number of possibilities you have to track — yet the answer is still just 3 weighings, because each weighing can be designed to have 3 meaningfully different outcomes.',
  },

  // --- Matchstick puzzles ---
  {
    id: 'matchstick-1',
    category: 'matchstick',
    difficulty: 1,
    prompt:
      'Using exactly 6 matchsticks (or pencils, or straws — anything straight and the same length), can you form 4 equilateral triangles, where every triangle\'s sides are made of exactly one matchstick each?',
    hints: [
      'It\'s impossible to do this flat on a table — think about building it upward instead.',
      'A flat triangle only ever uses 3 sticks for 1 triangle (or 5 sticks for 2 triangles side by side) — you need a shape with faces, not just edges on a table.',
      'Try building a pyramid with a triangular base, using 3 sticks for the base and 3 more standing up to meet at a point above it.',
    ],
    solution:
      'Build a triangular pyramid (tetrahedron): 3 matchsticks form a triangle flat on the table, and the other 3 stand up from each corner to meet at a single point above the middle. This 3D shape has 4 triangular faces — the base, plus 3 slanted ones — using only 6 sticks total.',
    explanation:
      'This puzzle trains exactly the kind of thinking the brief is going for: the answer only exists once you stop assuming the shape has to be flat. Most people try to rearrange triangles on the table for a while before realizing 3D is allowed.',
  },
  {
    id: 'matchstick-2',
    category: 'matchstick',
    difficulty: 3,
    prompt:
      'Using exactly 5 matchsticks, can you form 2 triangles, where the triangles share one side in common?',
    hints: [
      'If two triangles didn\'t share a side, you\'d need 3 sticks each — 6 total. You only have 5, so one stick has to do double duty.',
      'Think of a diamond/kite shape made of 4 sticks (2 triangles side by side, sharing their middle edge) — but that\'s only 4 sticks outlining 2 triangles without one of them being separately closed off.',
      'Try a diamond outline (4 sticks) plus one more stick straight through the middle, connecting the two side corners.',
    ],
    solution:
      'Arrange 4 matchsticks into a diamond (kite) shape — like a square tilted on its point. Then lay the 5th matchstick across the middle, connecting the left and right corners. This splits the diamond into 2 triangles that share that middle stick as a common side.',
    explanation:
      'The "shared side" is the key idea — instead of thinking of 2 separate triangles, think of one shape that can be split in half. A lot of matchstick puzzles are solved by spotting where two pieces can overlap on a single stick.',
  },
];
