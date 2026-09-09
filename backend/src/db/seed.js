require('dotenv').config();
const pool = require('./pool');

const seedData = [
  { source: 'Airplane', quote: "Surely you can't be serious." },
  { source: 'Airplane', quote: "I am serious. And don't call me Shirley." },
  { source: 'My Cousin Vinny', quote: "Everything that guy just said is bullshit. Thank you." },
  { source: 'Lord of the Rings', quote: "A wizard is never late, Frodo Baggins. Nor is he early. He arrives precisely when he means to.", speaker: 'Gandalf' },
  { source: 'Lord of the Rings', quote: "All we have to decide is what to do with the time that is given us.", speaker: 'Gandalf' },
  { source: 'The Jerk', quote: "He hates these cans! Stay away from the cans!" },
  { source: 'The Color Purple', quote: "When you ain't got no money, you gotta get an attitude" },
  { source: 'George Carlin', quote: "Don't sweat the petty things and don't pet the sweaty things", speaker: 'George Carlin', tags: ['comedy', 'wordplay'] },
  { source: 'George Carlin', quote: "I have lots of ideas. Trouble is, most of them suck.", speaker: 'George Carlin', tags: ['comedy', 'self-deprecating'] },
  { source: 'George Carlin', quote: "Scratch any cynic and you will find a disappointed idealist.", speaker: 'George Carlin', tags: ['comedy', 'philosophy'] },
  { source: 'Police Academy', quote: "Of all the guys who I thought were gonna make it, Hightower was the one. I mean, if all the cops looked like him there'd be no crime at all." },
  { source: 'Monty Python', quote: "Nobody expects the Spanish Inquisition!", tags: ['comedy', 'classic'] },
  { source: 'Monty Python', quote: "What is the airspeed velocity of an unladen swallow?", tags: ['comedy', 'classic'] },
  { source: 'Monty Python', quote: "Just a flesh wound.", tags: ['comedy', 'classic'] },
  { source: 'Monty Python', quote: "I don't want to talk to you no more, you empty-headed animal food trough wiper. I fart in your general direction. Your mother was a hamster and your father smelt of elderberries.", tags: ['comedy', 'insult'] },
  { source: 'Masters of the Universe 2026', quote: "In today's story, we saw that muscles don't necessarily make a man, and that having a skull for a face pretty much guarantees you're the bad guy! Until next time!" },
  { source: 'Masters of the Universe 2026', quote: "The universe shall quake in my shadow!", speaker: 'Skeletor' },
  { source: 'Masters of the Universe 2026', quote: "You gotta get behind yourself, not in front. A front's a facade. But you back yourself... there's nothing you can't achieve." },
  { source: 'Buckaroo Banzai', quote: "Hey, hey, hey, hey-now. Don't be mean; we don't have to be mean, cuz, remember, no matter where you go, there you are.", tags: ['philosophy', 'wisdom'] },
  { source: 'Buckaroo Banzai', quote: "History is-a made at night. Character is what you are in the dark." },
  { source: 'Letterkenny', quote: "B'y find the slot, stay where your too till I come where your at", tags: ['comedy', 'canadian'] },
  { source: 'Letterkenny', quote: "Long may your big jib draw boys", tags: ['comedy', 'canadian'] },
  { source: 'Daredevil', quote: "Hold on to it. Use two hands and never let go." },
  { source: 'Slapshot', quote: "The fans are standing up to them! The security guards are standing up to them! The peanut vendors are standing up to them! And by golly, if I could get down there, I'd be standing up to them!" },
  { source: 'Slapshot', quote: "You do that, you go to the box, you know. Two minutes, by yourself, you know and you feel shame, you know. And then you get free." },
  { source: 'Spider-man 2002', quote: "Sorry I'm late. Work was murder.", speaker: 'Peter Parker' },
  { source: 'Spider-man 2002', quote: "But the one thing they love more than a hero... is to see a hero fail, fall, die trying. In spite of everything you've done for them, eventually they will hate you. Why bother?", speaker: 'Green Goblin', used: true },
  { source: 'Spider-man 2002', quote: "This is why only fools are heroes - because you never know when some lunatic will come along with a sadistic choice.", speaker: 'Green Goblin' },
  { source: 'Ghost Dog: The Way of the Samurai', quote: "In the words of the ancients, one should make his decision within the space of seven breaths.", tags: ['philosophy', 'wisdom'] },
  { source: 'Ghost Dog: The Way of the Samurai', quote: "Our bodies are given life from the midst of nothingness. Existing where there is nothing is the meaning of the phrase 'Form is emptiness.'", tags: ['philosophy'] },
  { source: 'Office Space', quote: "Now Milton, don't be greedy, let's pass it along and make sure everyone gets a piece.", used: true },
  { source: 'Office Space', quote: "Sounds like a case of the Mondays.", tags: ['work', 'comedy'] },
  { source: 'Office Space', quote: "Excuse me, I believe you have my stapler...", speaker: 'Milton', used: true, tags: ['work', 'comedy'] },
  { source: 'Portal 2', quote: "This next test is very dangerous. To help you remain tranquil in the face of almost certain death, smooth jazz will be deployed, in three, two, one", speaker: 'GLaDOS', tags: ['gaming', 'comedy'] },
  { source: 'Portal 2', quote: "Great work! Because this message is prerecorded, many observations related to your performance are speculation on our part. Please disregard any undeserved compliments.", used: true, tags: ['gaming', 'comedy'] },
  { source: 'Jaws', quote: "I'll catch this bird for you, but it ain't gonna be easy.", speaker: 'Quint', used: true },
  { source: 'Jaws', quote: "I'm not going to waste my time arguing with a man who's lining up to be a hot lunch." },
  { source: 'Jaws', quote: "It's only an island if you look at it from the water." },
  { source: 'Jaws', quote: "You yell barracuda, everybody says, 'Huh? What?' You yell shark, we've got a panic on our hands on the Fourth of July.", used: true },
  { source: 'Dune', quote: "The mystery of life isn't a problem to solve, but a reality to experience.", tags: ['philosophy', 'sci-fi'] },
  { source: 'Dune', quote: "What do you despise? By this are you truly known.", tags: ['philosophy', 'sci-fi'] },
  { source: 'Dune', quote: "Hope clouds observation.", tags: ['philosophy', 'sci-fi'] },
  { source: 'Dune', quote: "Without change something sleeps inside us, and seldom awakens. The sleeper must awaken.", tags: ['philosophy', 'sci-fi'] },
  { source: 'Dune', quote: "It is by will alone I set my mind in motion. It is by the juice of Sapho that thoughts acquire speed, the lips acquire stains, the stains become a warning.", speaker: 'Mentat', tags: ['sci-fi'] },
  { source: 'Everything Everywhere All at Once', quote: "You tell me it's a cruel world and we're all running around in circles. I know that. I've been on this earth just as many days as you.", tags: ['philosophy'] },
  { source: 'Everything Everywhere All at Once', quote: "You are not unlovable. There is always something to love. Even in a stupid, stupid universe where we have hot dogs for fingers, we get very good with our feet.", tags: ['philosophy', 'wholesome'] },
  { source: 'Groundhog Day', quote: "Okay, campers, rise and shine, and don't forget your booties 'cause it's cooooold out there today.", speaker: 'Phil Connors' },
  { source: 'Groundhog Day', quote: "Do you ever have déjà vu? / Didn't you just ask me that?", used: true },
  { source: 'Zoolander', quote: "I invented the piano key necktie, I invented it!", speaker: 'Mugatu', tags: ['comedy', 'fashion'] },
  { source: 'Zoolander', quote: "What is this, a center for ants?", speaker: 'Derek Zoolander', tags: ['comedy'] },
  { source: 'Zoolander', quote: "Moisture is the essence of wetness, and wetness is the essence of beauty.", speaker: 'Derek Zoolander', tags: ['comedy'] },
  { source: 'Better Off Dead', quote: "I want my two dollars!", used: true, tags: ['comedy', '80s'] },
  { source: 'Better Off Dead', quote: "It's got raisins in it... you like raisins.", tags: ['comedy', '80s'] },
  { source: 'Better Off Dead', quote: "Go that way, really fast. If something gets in your way, turn.", used: true, tags: ['comedy', '80s', 'advice'] },
];

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Seeding database...');

    for (const item of seedData) {
      await client.query(
        `INSERT INTO quotes (source_name, quote_text, speaker_1, tags, used_at, contributor, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          item.source,
          item.quote,
          item.speaker || null,
          item.tags || [],
          item.used ? new Date() : null,
          'Initial Seed',
          item.image_url || item.image || null
        ]
      );
    }

    const count = await client.query('SELECT COUNT(*) FROM quotes');
    console.log(`Seeding complete. ${count.rows[0].count} quotes in database.`);
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
