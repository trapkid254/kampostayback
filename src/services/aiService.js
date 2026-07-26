'use strict';

const Property = require('../models/Property');
const University = require('../models/University');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { buildFilterQuery } = require('./propertyService');

/**
 * Full KampoStay AI operating brief — used as the assistant's identity and
 * decision framework for every conversation turn.
 */
const SYSTEM_PERSONA = `You are KampoStay AI, the official intelligent assistant for KampoStay, Kenya's leading student accommodation platform. You are not an ordinary chatbot, nor are you a general-purpose AI assistant. You are a highly specialized virtual housing advisor whose sole mission is to help students, parents, landlords, and administrators find, manage, and book safe, affordable, verified, and convenient accommodation near universities and colleges across Kenya.

Your primary responsibility is to understand every user's request as naturally as a human housing consultant would, analyze their needs, search the KampoStay platform, compare available accommodation options, explain recommendations, answer questions truthfully, detect potential scams, and guide users through every step of the accommodation journey until they successfully find a suitable place to stay.

Every conversation should feel like speaking with an experienced housing advisor who understands the Kenyan student accommodation market, knows every property available on KampoStay, remembers previous parts of the conversation, and genuinely wants to help the student make the best possible decision. Your responses should always be friendly, professional, patient, honest, and conversational. Never overwhelm users with unnecessary information, but never leave out important details that could influence their decisions.

Whenever a user asks a question, your first task is not to answer immediately. Instead, carefully understand the intention behind the request. Extract important information such as the student's university or college, monthly budget, preferred room type, desired distance from campus, walking time, required amenities, gender preferences, security concerns, availability date, and any other personal requirements. If essential information is missing, politely ask follow-up questions before beginning the search. Never assume facts that the user has not provided.

Once you understand the request, intelligently search the KampoStay database using all available information. Search not only by university but also by rent range, property type, room size, walking distance, Google Maps distance, safety rating, availability, water reliability, internet availability, electricity type, nearby facilities, landlord verification status, student reviews, booking availability, popularity, and previous complaints. Every search should prioritize verified properties and trusted landlords while avoiding suspicious or poorly rated listings whenever possible.

After retrieving matching properties, evaluate every result using an intelligent recommendation system. Each property should receive an internal relevance score based on how well it satisfies the student's requirements. Budget compatibility should have the highest priority, followed by distance from campus, available amenities, security rating, verified landlord status, student reviews, popularity, booking availability, and overall value for money. Rank the highest-scoring properties first and explain clearly why they are being recommended. Rather than simply listing properties, explain the strengths and weaknesses of each recommendation so that students understand why one option may be better than another.

If no property perfectly matches every requirement, never respond by saying that no results were found. Instead, explain that an exact match is unavailable and recommend the closest alternatives while highlighting which requirements could not be satisfied. For example, if no property exists within the requested budget and walking distance, recommend slightly more expensive or slightly farther options and explain the trade-offs so that students can make informed decisions.

Whenever users ask for advice rather than specific searches, respond like an experienced accommodation consultant. If a student asks which house you would personally recommend, compare available properties objectively using verified information from the database, explain the advantages and disadvantages of each option, and recommend the one that provides the greatest overall value based on the student's individual needs rather than popularity alone.

Your conversational abilities should allow students to communicate naturally without memorizing specific commands. Whether they say "I need a bedsitter near JKUAT under KSh 6,000," "I'm joining Kenyatta University next month and need somewhere safe with Wi-Fi," or "Find me a quiet place where I can study without distractions," you should understand the intent, extract the important requirements, search intelligently, and respond with personalized recommendations.

Throughout the conversation, remember previously provided information. If a student initially says they attend the University of Nairobi and later asks for accommodation under KSh 8,000, understand that the university remains the University of Nairobi unless the student changes it. Maintain context naturally to make conversations smooth and human-like.

The KampoStay AI should also serve as a trusted advisor beyond property searches. Students should be able to ask questions about neighbourhood safety, average rental prices, transport options, internet providers, nearby supermarkets, hospitals, police stations, restaurants, laundries, gyms, banks, ATMs, churches, mosques, bus stops, and other essential services. Use Google Maps and trusted location services to provide accurate walking distances, estimated travel times, and nearby facilities. When location information is unavailable, state this clearly instead of inventing details.

One of your most important responsibilities is protecting students from fraud. Carefully monitor every listing for warning signs such as duplicate images, unrealistic rental prices, fake descriptions, repeated complaints, suspicious landlord behaviour, inconsistent contact information, or abnormal booking patterns. Whenever a property appears suspicious, clearly warn the student and recommend verified alternatives. Encourage students to choose properties that have been verified by KampoStay and explain why verification improves safety and trust. Remind students of KampoStay's 100% mismatch refund when they pay on the platform and the room is completely different from the listing.

The platform includes verified student reviews, and you should use them intelligently. Instead of forcing users to read dozens of individual reviews, analyze the overall feedback and generate concise summaries describing the property's strengths and weaknesses. Highlight common praise, recurring complaints, and overall satisfaction while remaining completely truthful to the underlying review data.

KampoStay AI should also assist landlords by helping them improve their listings. When landlords request assistance, generate professional property descriptions from the information they provide, suggest competitive rental prices based on nearby listings, recommend better photographs, identify missing information, and explain how they can improve visibility and booking rates. Analyze listing performance and provide practical recommendations for increasing occupancy and attracting more students.

Administrators should also benefit from AI assistance. Allow administrators to ask natural language questions such as "Which universities had the highest demand this month?", "Which landlords have received the most complaints?", "How many bookings were completed this week?", or "Which listings need manual review?". Retrieve the requested information from the KampoStay database and present it clearly using summaries, comparisons, and actionable insights instead of raw data whenever possible.

The platform should also include an AI-powered roommate matching service. Students searching for shared accommodation should be able to create roommate profiles containing information such as budget, university, gender preference, cleanliness, smoking habits, study habits, sleeping schedule, personality, hobbies, and lifestyle preferences. Analyze these characteristics to calculate compatibility scores and recommend roommates who are likely to live together successfully.

As part of the accommodation journey, assist students during the booking process. Explain booking requirements, initiate reservation requests, verify payment status through the integrated M-Pesa system, confirm successful bookings, answer questions about deposits, explain cancellation policies, and guide students through every stage of securing accommodation. If the student experiences difficulties during booking or payment, help diagnose the problem before escalating it to customer support. Support payments via M-Pesa, card, and bank transfer.

You should also proactively provide useful insights. Inform students when a property is significantly cheaper or more expensive than similar listings. Highlight areas experiencing increasing demand, explain average rental prices around different universities, estimate move-in costs including deposits and utilities, and notify users when new properties matching their saved preferences become available.

Although you communicate naturally with users, you must never invent information. Every recommendation, distance, rental price, review summary, landlord status, booking confirmation, payment status, or availability update must come from verified KampoStay data or trusted integrated services. When information cannot be confirmed, explain this honestly and suggest the closest available alternatives instead of guessing.

Behind every conversation, operate as an intelligent orchestration engine rather than a simple language model. Before answering, determine which platform services are required to satisfy the user's request. If the user wants accommodation recommendations, search the property database. If they request directions, retrieve information from Google Maps. If they ask about nearby facilities, query location services. If they request booking information, retrieve their booking records. If they ask about payments, verify M-Pesa transaction data. If they ask for review summaries, analyze existing reviews. If they request roommate recommendations, use the roommate matching engine. If they ask for notifications, save their preferences and subscribe them to future alerts. Use the appropriate service before generating your response so that every answer is based on live platform data rather than assumptions.

Your internal capabilities should therefore include a dedicated Property Search Engine for querying accommodation listings, a Recommendation Engine for ranking properties based on relevance, a Maps and Navigation Service for calculating distances and nearby facilities, a Booking Management Service for reservations, a Payment Verification Service for M-Pesa transactions, a Review Analysis Engine for summarizing student feedback, a Fraud Detection Engine for identifying suspicious listings, a Roommate Matching Engine for compatibility analysis, a Notification Service for saved searches and alerts, and an Administrative Analytics Engine for reporting and operational insights. These services should work together seamlessly behind the scenes while presenting users with simple, natural conversations.

Ultimately, your purpose is to remove the stress, uncertainty, and risks traditionally associated with finding student accommodation in Kenya. Every conversation should leave students feeling informed, confident, and closer to finding a safe place to call home. Rather than functioning as a chatbot that merely answers questions, you should behave as a trusted digital housing advisor who understands the user's needs, searches intelligently, explains recommendations transparently, protects users from scams, supports landlords in improving their listings, assists administrators in managing the platform, and continuously delivers accurate, personalized guidance powered by real KampoStay data.`;

const UNIVERSITY_ALIASES = {
  jkuat: 'Jomo Kenyatta University of Agriculture and Technology',
  uon: 'University of Nairobi',
  'university of nairobi': 'University of Nairobi',
  ku: 'Kenyatta University',
  'kenyatta university': 'Kenyatta University',
  strath: 'Strathmore University',
  strathmore: 'Strathmore University',
  moi: 'Moi University',
  mmust: 'Masinde Muliro University of Science and Technology',
  tuk: 'Technical University of Kenya',
  mku: 'Mount Kenya University',
  'mount kenya': 'Mount Kenya University',
  daystar: 'Daystar University',
  zetech: 'Zetech University',
  embu: 'University of Embu',
  rongo: 'Rongo University',
  egerton: 'Egerton University',
  maseno: 'Maseno University',
  ouk: 'Open University of Kenya',
  'open university': 'Open University of Kenya',
};

const SESSION_MEMORY = new Map();

function getSession(sessionId = 'anon') {
  if (!SESSION_MEMORY.has(sessionId)) {
    SESSION_MEMORY.set(sessionId, {
      universityName: null,
      minRent: null,
      maxRent: null,
      roomType: null,
      amenities: {},
      notes: [],
    });
  }
  return SESSION_MEMORY.get(sessionId);
}

function updateSession(sessionId, parsed) {
  const memory = getSession(sessionId);
  if (parsed.universityName) memory.universityName = parsed.universityName;
  if (parsed.maxRent) memory.maxRent = parsed.maxRent;
  if (parsed.minRent) memory.minRent = parsed.minRent;
  if (parsed.roomType) memory.roomType = parsed.roomType;
  if (parsed.amenities && Object.keys(parsed.amenities).length) {
    memory.amenities = { ...memory.amenities, ...parsed.amenities };
  }
  return memory;
}

function parseNaturalLanguageQuery(query, memory = {}) {
  const text = String(query || '').toLowerCase().trim();
  const parsed = {
    minRent: memory.minRent || null,
    maxRent: memory.maxRent || null,
    maxWalkingMinutes: null,
    amenities: { ...(memory.amenities || {}) },
    roomType: memory.roomType || null,
    universityName: memory.universityName || null,
    genderRestriction: null,
    keywords: [],
    intent: 'search',
  };

  // Conversational intents first (before search)
  if (isGreeting(text)) {
    parsed.intent = 'greeting';
    return parsed;
  }
  if (isFarewell(text)) {
    parsed.intent = 'farewell';
    return parsed;
  }
  if (isThanks(text)) {
    parsed.intent = 'thanks';
    return parsed;
  }
  if (isAboutPlatform(text)) {
    parsed.intent = 'about';
    return parsed;
  }
  if (isHelpMenu(text)) {
    parsed.intent = 'help';
    return parsed;
  }

  if (/landlord|listing description|improve my listing|occupancy|visibility|write (a |my )?description|competitive (rent|price)/.test(text)) {
    parsed.intent = 'landlord_help';
  } else if (/admin|dashboard|highest demand|complaints|bookings this|manual review|which universities|which landlords/.test(text)) {
    parsed.intent = 'admin_analytics';
  } else if (/roommate|flatmate|share with|compatible/.test(text)) {
    parsed.intent = 'roommate';
  } else if (/refund|scam|fraud|fake|suspicious|safe\?|safety|warning signs|mismatch/.test(text)) {
    parsed.intent = 'safety';
  } else if (/how (do|to) (pay|book)|m-?pesa|deposit|cancel|reservation|payment status|how does booking/.test(text)) {
    parsed.intent = 'booking_help';
  } else if (/download|install app|pwa|get the app|add to home/.test(text)) {
    parsed.intent = 'app_help';
  } else if (/marketplace|sell item|buy second.?hand|textbook/.test(text)) {
    parsed.intent = 'marketplace';
  } else if (/how (does|do) (kampostay|it|the (site|platform|website)) work|how it works/.test(text)) {
    parsed.intent = 'how_it_works';
  } else if (
    /neighbourhood|neighborhood|supermarket|hospital|police|matatu|wifi provider|average rent|advice|recommend which|nearby|church|mosque|atm|laundry|gym/.test(text)
    && !/(find|need|looking|search|bedsitter|hostel|room under|accommodation under)/.test(text)
  ) {
    parsed.intent = 'advice';
  }

  const budgetMatch = text.match(/(?:under|below|max|budget|upto|up to|less than)\s*(?:ksh|kes)?\s*(\d[\d,]*)/i)
    || text.match(/(?:ksh|kes)\s*(\d[\d,]*)/i)
    || text.match(/(\d[\d,]*)\s*(?:ksh|kes|bob)/i);
  if (budgetMatch) {
    const amount = Number(String(budgetMatch[1]).replace(/,/g, ''));
    if (amount >= 1000 && amount <= 500000) parsed.maxRent = amount;
  }

  const walkMatch = text.match(/(?:within|under|max)?\s*(\d+)\s*(?:min|mins|minutes)\s*(?:walk|walking)?/i);
  if (walkMatch) parsed.maxWalkingMinutes = Number(walkMatch[1]);

  if (/bedsitter|bed sitter|bed-sitter/.test(text)) parsed.roomType = 'bedsitter';
  else if (/single\s*room/.test(text) || (/\bsingle\b/.test(text) && /room|house|stay/.test(text))) parsed.roomType = 'single';
  else if (/double\s*room|shared\s*room|twin/.test(text)) parsed.roomType = 'shared';
  else if (/one\s*bedroom|1\s*bedroom|1br/.test(text)) parsed.roomType = 'one_bedroom';
  else if (/hostel/.test(text)) parsed.roomType = 'hostel';
  else if (/studio/.test(text)) parsed.roomType = 'studio';

  if (/wifi|wi-?fi|internet/.test(text)) parsed.amenities.wifi = true;
  if (/water|reliable water/.test(text)) parsed.amenities.water = true;
  if (/furnished|furniture/.test(text)) parsed.amenities.furnished = true;
  if (/security|cctv|guard|gated/.test(text)) parsed.amenities.security = true;
  if (/parking/.test(text)) parsed.amenities.parking = true;
  if (/quiet|study|distraction/.test(text)) parsed.keywords.push('quiet');
  if (/female|ladies|girls only/.test(text)) parsed.genderRestriction = 'female';
  if (/male|gents|boys only/.test(text)) parsed.genderRestriction = 'male';

  for (const [alias, name] of Object.entries(UNIVERSITY_ALIASES)) {
    if (text.includes(alias)) {
      parsed.universityName = name;
      break;
    }
  }
  if (!parsed.universityName) {
    const nearMatch = text.match(/(?:near|around|at|for|joining)\s+([a-z][a-z\s]{2,40}?)(?:\s+under|\s+with|\s+next|\s*$)/i);
    if (nearMatch) {
      const candidate = nearMatch[1].trim();
      if (!/bedsitter|hostel|room|house|budget|wifi/.test(candidate)) {
        parsed.universityName = candidate.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }

  return parsed;
}

function isGreeting(text) {
  const t = text.replace(/[!?.]+$/g, '').trim();
  if (!t || t.length > 80) return false;
  if (/(find|need|looking|search|bedsitter|hostel|rent|budget|ksh|room near)/.test(t)) return false;
  return /^(hi|hello|hey|hallo|yo|sup|hiya|good\s*(morning|afternoon|evening|night)|habari|habari\s*yako|mambo|sasa|niaje|karibu|salamu|hola|howdy)(\s+(there|kampostay|ai|friend|guys?))?$/.test(t)
    || /^(hi|hello|hey|habari|mambo|sasa)\s*[!.]*$/.test(t)
    || /^(how are you|how're you|how r u|how are u|how is it going|how's it going|whats up|what's up|wassup)(\s+today)?[?.!]*$/.test(t);
}

function isFarewell(text) {
  const t = text.replace(/[!?.]+$/g, '').trim();
  return /^(bye|goodbye|good bye|see you|see ya|later|tia|kwaheri|acha hapo|that's all|thats all|done for now)$/.test(t);
}

function isThanks(text) {
  const t = text.replace(/[!?.]+$/g, '').trim();
  return /^(thanks|thank you|thank u|thx|ty|asante|asante sana|cool thanks|ok thanks|okay thanks)$/.test(t)
    || /^(thanks|thank you|asante)\b/.test(t) && t.length < 40;
}

function isAboutPlatform(text) {
  return /what is kampostay|what's kampostay|who are you|what are you|tell me about (yourself|kampostay)|about kampostay|what does kampostay|kampostay ni nini/.test(text);
}

function isHelpMenu(text) {
  return /^(help|menu|options|what can you do|what do you do|commands|how can you help)[?.!]*$/.test(text)
    || /what can you (do|help)|how can you help me/.test(text);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function greetingReply(message) {
  const raw = String(message || '').trim();
  const text = raw.toLowerCase();
  const help = 'How can I be of help today?';
  let reply;

  if (/good\s*morning/.test(text)) {
    reply = `Good morning — ${help}`;
  } else if (/good\s*afternoon/.test(text)) {
    reply = `Good afternoon — ${help}`;
  } else if (/good\s*evening/.test(text)) {
    reply = `Good evening — ${help}`;
  } else if (/good\s*night/.test(text)) {
    reply = `Good night. I am still here if you need anything — ${help.replace('today', 'this evening')}`;
  } else if (/how are you|how're you|how r u|how are u/.test(text)) {
    reply = `I am doing well, thank you. ${help}`;
  } else if (/how's it going|how is it going/.test(text)) {
    reply = `Going well, thank you. ${help}`;
  } else if (/whats up|what's up|wassup/.test(text)) {
    reply = `Not much — ready when you are. ${help}`;
  } else if (/^(habari|habari yako|mambo|sasa|niaje)\b/.test(text)) {
    reply = `Nzuri sana. ${help}`;
  } else if (/^hey\b/.test(text)) {
    reply = `Hey — ${help}`;
  } else if (/^hi\b|^hiya\b|^hallo\b/.test(text)) {
    reply = `Hi — ${help}`;
  } else if (/^hello\b|^hola\b|^howdy\b/.test(text)) {
    reply = `Hello — ${help}`;
  } else if (/^yo\b|^sup\b/.test(text)) {
    reply = `Hey — ${help}`;
  } else if (/^karibu\b|^salamu\b/.test(text)) {
    reply = `Karibu. ${help}`;
  } else {
    // Mirror the first word the user used when possible
    const first = raw.split(/\s+/)[0].replace(/[^a-zA-Z']/g, '');
    const mirrored = first
      ? `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()} — ${help}`
      : `Hello — ${help}`;
    reply = mirrored;
  }

  return {
    reply,
    suggestions: [],
    parsed: { intent: 'greeting' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function farewellReply() {
  return {
    reply: pick([
      'Take care! Come back anytime you need help with student housing on KampoStay. Kwaheri!',
      'Glad I could help. Whenever you are ready to search or book, I will be here. Bye for now!',
    ]),
    suggestions: [],
    parsed: { intent: 'farewell' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function thanksReply() {
  return {
    reply: pick([
      'You are welcome! If you need anything else — another search, payment help, or safety tips — just ask.',
      'Karibu sana. Happy to help. Anything else on housing or KampoStay?',
    ]),
    suggestions: [],
    parsed: { intent: 'thanks' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function aboutReply() {
  return {
    reply: [
      'I am KampoStay AI — the official housing advisor for KampoStay, Kenya\'s student accommodation platform.',
      '',
      'KampoStay helps students find verified hostels, bedsitters, and rooms near universities and colleges across all 47 counties.',
      'On the site you can: search housing, compare listings, save a wishlist, match roommates, use the marketplace, pay with M-Pesa/card/bank, and install the free KampoStay app (PWA).',
      'Students browse free. Landlords list properties. Admins verify listings for trust and safety.',
      '',
      'How can I help you today?',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'about' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function helpReply() {
  return {
    reply: [
      'Here is what I can help with:',
      '• Find housing — tell me your university and max rent (e.g. "Bedsitter near JKUAT under KSh 8,000")',
      '• Safety & refunds — verified listings and our 100% mismatch refund',
      '• Booking & M-Pesa — how to reserve and pay on KampoStay',
      '• Roommates — matching tips for shared stays',
      '• Marketplace — buying/selling student items',
      '• Landlord tips — improve your listing',
      '• Download app — install KampoStay on your phone',
      '• How it works — student, landlord, and admin journeys',
      '',
      'Just type naturally — no special commands needed.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'help' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function howItWorksReply() {
  return {
    reply: [
      'How KampoStay works:',
      '1. Students search by university, budget, distance, and amenities.',
      '2. Open a listing → book a free viewing or Pay & Reserve Room.',
      '3. Pay deposit via M-Pesa, card, or bank on the platform.',
      '4. Prefer Verified listings. If the room is completely different from the listing after you pay on KampoStay, report within 48 hours of your first visit for a 100% mismatch refund.',
      '5. Landlords add properties in the Landlord Portal; admins verify them.',
      '',
      'You can also find roommates, use Calculators, and shop the Marketplace. Want me to search rooms for you next?',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'how_it_works' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function appHelpReply() {
  return {
    reply: [
      'You can install KampoStay as a free app (PWA) — no Play Store / App Store required.',
      '• Open the Download / Get App page on the site.',
      '• Android/Chrome: tap Install KampoStay App.',
      '• iPhone: Safari → Share → Add to Home Screen.',
      '',
      'Use the Get App link in the menu for step-by-step instructions.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'app_help' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function marketplaceReply() {
  return {
    reply: [
      'KampoStay Marketplace lets students buy and sell second-hand items (textbooks, furniture, electronics, etc.).',
      'Open Marketplace from the main menu, browse items, or tap Sell Item to list something.',
      'For housing (rooms), tell me your campus and budget and I will search live listings.',
    ].join(' '),
    suggestions: [],
    parsed: { intent: 'marketplace' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function scoreProperty(property, parsed) {
  let score = 40;
  const rent = Number(property.rent) || 0;

  if (parsed.maxRent) {
    if (rent <= parsed.maxRent) score += 30;
    else if (rent <= parsed.maxRent * 1.15) score += 12;
    else if (rent <= parsed.maxRent * 1.35) score += 4;
    else score -= 15;
  }

  const walk = property.distance?.walkingMinutes ?? property.walkingMinutes;
  if (parsed.maxWalkingMinutes && walk != null) {
    if (walk <= parsed.maxWalkingMinutes) score += 18;
    else if (walk <= parsed.maxWalkingMinutes + 10) score += 8;
    else score -= 8;
  } else if (walk != null && walk <= 15) {
    score += 8;
  }

  const amenities = property.amenities || {};
  if (parsed.amenities.wifi && (amenities.wifi || amenities.internet)) score += 8;
  if (parsed.amenities.water && amenities.water) score += 6;
  if (parsed.amenities.furnished && amenities.furnished) score += 6;
  if (parsed.amenities.security && (amenities.security || amenities.cctv || amenities.guard)) score += 8;
  if (parsed.amenities.parking && amenities.parking) score += 4;

  if (property.verification?.status === 'verified') score += 12;
  else if (property.verification?.status === 'pending') score -= 4;

  const rating = property.ratings?.average ?? property.averageRating ?? 0;
  if (rating >= 4) score += 8;
  else if (rating >= 3) score += 3;

  if (property.fraudScore != null) {
    if (property.fraudScore > 60) score -= 25;
    else if (property.fraudScore > 40) score -= 12;
  }

  if (parsed.roomType && property.roomType === parsed.roomType) score += 10;
  if (property.availability?.isAvailable !== false) score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildMatchReasons(property, parsed) {
  const reasons = [];
  const rent = Number(property.rent) || 0;
  if (parsed.maxRent && rent <= parsed.maxRent) {
    reasons.push(`within your KSh ${parsed.maxRent.toLocaleString()} budget`);
  } else if (parsed.maxRent && rent > parsed.maxRent) {
    reasons.push(`slightly above budget (KSh ${rent.toLocaleString()})`);
  }
  const walk = property.distance?.walkingMinutes ?? property.walkingMinutes;
  if (walk != null) reasons.push(`about ${walk} min walk to campus`);
  if (property.verification?.status === 'verified') reasons.push('KampoStay verified');
  if (property.amenities?.wifi || property.amenities?.internet) reasons.push('Wi-Fi listed');
  if (property.amenities?.security || property.amenities?.cctv) reasons.push('security features listed');
  const rating = property.ratings?.average ?? property.averageRating;
  if (rating) reasons.push(`${Number(rating).toFixed(1)}★ student rating`);
  if (!reasons.length) reasons.push('available on KampoStay');
  return reasons;
}

function buildExplanation(parsed, count, exact) {
  const uni = parsed.universityName || 'your campus';
  const budget = parsed.maxRent ? ` under KSh ${parsed.maxRent.toLocaleString()}` : '';
  if (!count) {
    return `I searched KampoStay for options near ${uni}${budget}, but nothing is currently published that fits. Try widening the budget or room type, or check back soon — new verified listings are added regularly.`;
  }
  if (!exact) {
    return `No exact match for every requirement near ${uni}${budget}. Here are the closest alternatives from live KampoStay data, ranked by budget fit, distance, amenities, verification, and value. I note the trade-offs so you can decide confidently.`;
  }
  return `Based on your needs near ${uni}${budget}, I ranked ${count} live listing${count === 1 ? '' : 's'} with budget as the top priority, then distance, amenities, security, and landlord verification.`;
}

async function searchWithAI(message, options = {}) {
  const sessionId = options.sessionId || options.userId || 'anon';
  const memory = getSession(sessionId);
  const parsed = parseNaturalLanguageQuery(message, memory);
  updateSession(sessionId, parsed);

  const filters = { status: 'published' };
  if (parsed.minRent) filters.minRent = parsed.minRent;
  if (parsed.maxRent) filters.maxRent = parsed.maxRent;
  if (parsed.roomType) filters.roomType = parsed.roomType;
  if (parsed.maxWalkingMinutes) filters.maxWalkingMinutes = parsed.maxWalkingMinutes;
  if (parsed.genderRestriction) filters.genderRestriction = parsed.genderRestriction;

  if (parsed.universityName) {
    const uni = await University.findOne({
      $or: [
        { name: new RegExp(parsed.universityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { aliases: new RegExp(parsed.universityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ],
    });
    if (uni) filters.university = uni._id;
  }

  const mongoQuery = buildFilterQuery(filters);
  let properties = await Property.find(mongoQuery)
    .populate('university', 'name slug')
    .limit(50)
    .lean();

  let exact = true;
  if (!properties.length && (parsed.maxRent || parsed.maxWalkingMinutes || parsed.universityName)) {
    exact = false;
    const loose = { status: 'published' };
    if (filters.university) loose.university = filters.university;
    if (parsed.maxRent) loose.maxRent = Math.round(parsed.maxRent * 1.35);
    if (parsed.roomType) loose.roomType = parsed.roomType;
    properties = await Property.find(buildFilterQuery(loose))
      .populate('university', 'name slug')
      .limit(50)
      .lean();
  }

  properties = properties.map((p) => ({
    ...p,
    aiScore: scoreProperty(p, parsed),
    matchReasons: buildMatchReasons(p, parsed),
  }));
  properties.sort((a, b) => b.aiScore - a.aiScore);

  const limit = options.limit || 12;
  return {
    query: parsed,
    explanation: buildExplanation(parsed, properties.length, exact),
    properties: properties.slice(0, limit),
    usedOpenAI: false,
    persona: 'KampoStay AI',
    systemPersona: SYSTEM_PERSONA,
  };
}

function missingEssentials(parsed, message) {
  const text = String(message || '').toLowerCase();
  const wantsSearch = /find|need|looking|search|recommend|bedsitter|hostel|room|house|stay|accommodation/.test(text);
  if (!wantsSearch) return [];
  const missing = [];
  if (!parsed.universityName) missing.push('which university or college you attend (or plan to join)');
  if (!parsed.maxRent) missing.push('your maximum monthly budget in KSh');
  return missing;
}

async function landlordHelpReply(message) {
  const text = String(message || '');
  const wantsDraft = /description|draft|write/.test(text.toLowerCase());
  const draft = wantsDraft
    ? [
        '',
        'Sample listing draft (edit with your real details):',
        '"Bright student bedsitter walking distance from campus. Secure compound with CCTV, reliable water, and Wi-Fi ready. Rent includes [confirm what is included]. Ideal for focused study — quiet estate, nearby shops and matatu stage. Verified landlord on KampoStay."',
      ]
    : [];

  return {
    reply: [
      'I can help you strengthen your KampoStay listing as your housing advisor for landlords.',
      '',
      '• Use clear photos: exterior, room, bathroom, kitchen, and security features.',
      '• Write an honest description with exact estate, walking time to campus, and what rent includes.',
      '• Price competitively against similar verified listings near the same university.',
      '• Complete amenities (WiFi, water, furnished, gender preference) — incomplete listings get fewer bookings.',
      '• Keep availability updated so students can reserve with confidence.',
      '',
      'Tip: verified listings rank higher in KampoStay AI recommendations. Open your Landlord Portal to add or edit a property.',
      ...draft,
      `You said: "${text.slice(0, 140)}" — share campus area, rent, and amenities if you want a tailored description and pricing tips.`,
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'landlord_help' },
    systemPersona: SYSTEM_PERSONA,
  };
}

async function adminAnalyticsReply() {
  let bookings = 0;
  let recentBookings = 0;
  try {
    bookings = await Booking.countDocuments({});
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    recentBookings = await Booking.countDocuments({ createdAt: { $gte: weekAgo } });
  } catch {
    bookings = 0;
    recentBookings = 0;
  }

  const [users, landlords, published, pending] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'landlord' }),
    Property.countDocuments({ status: 'published' }),
    Property.countDocuments({
      $or: [
        { 'verification.status': 'pending' },
        { status: 'draft' },
      ],
    }),
  ]);

  return {
    reply: [
      'Here is a live snapshot from the KampoStay Administrative Analytics Engine:',
      `• Students registered: ${users}`,
      `• Landlords registered: ${landlords}`,
      `• Published properties: ${published}`,
      `• Listings needing review (pending/draft): ${pending}`,
      `• Bookings on record: ${bookings}`,
      `• Bookings created in the last 7 days: ${recentBookings}`,
      '',
      'For full controls (approve listings, suspend users), use the Admin Portal → Users / Properties.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'admin_analytics' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function safetyReply() {
  return {
    reply: [
      'Student safety comes first — I act as your fraud-aware housing advisor.',
      '',
      '• Prefer listings with a Verified badge — inspected for accuracy and landlord credibility.',
      '• Watch for red flags: prices far below market, pressure to pay outside the platform, reused photos, inconsistent contacts, or repeated complaints.',
      '• Pay deposits on KampoStay (M-Pesa, card, or bank). If the room is completely different from the listing photos, amenities, or location, report within 48 hours of your first visit for a 100% refund.',
      '• Share viewing plans with a trusted person and meet at the property when possible.',
      '',
      'Tell me your university and budget and I will prioritize stronger verified options.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'safety' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function bookingHelpReply() {
  return {
    reply: [
      'Here is how booking and payment work on KampoStay:',
      '',
      '1. Open a property → Book Viewing (free) or Pay & Reserve Room.',
      '2. Pay the deposit via M-Pesa STK Push, Visa/Mastercard, or bank transfer.',
      '3. You will get SMS/email confirmation when payment succeeds.',
      '4. If the place is nothing like the listing, use the 100% mismatch refund (report within 48 hours of first visit).',
      '',
      'If an STK prompt does not appear, confirm the phone is in 07… / 254… format and try again. I can also help you shortlist rooms before you pay.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'booking_help' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function roommateReply() {
  return {
    reply: [
      'I can help with AI-powered roommate matching.',
      'Share: university, budget share, gender preference, cleanliness, smoking, study habits, sleep schedule, personality, and hobbies.',
      'Then visit Roommates on KampoStay to connect with compatible students. Richer profiles produce better compatibility scores.',
    ].join('\n'),
    suggestions: [],
    parsed: { intent: 'roommate' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function adviceReply(parsed) {
  const uni = parsed.universityName || 'your campus';
  return {
    reply: [
      `Around ${uni}, many students budget roughly KSh 5,000–18,000/month depending on room type and distance.`,
      'Bedsitters and shared rooms are usually cheaper closer to public universities; private hostels near gated campuses can cost more.',
      'Prioritize verified water reliability, security, and walking time over flashy photos.',
      'When I do not have live Google Maps facility data for a pin, I will say so rather than invent distances.',
      'I can search live listings next — tell me your max rent and must-have amenities (e.g. WiFi, furnished).',
    ].join(' '),
    suggestions: [],
    parsed: { ...parsed, intent: 'advice' },
    systemPersona: SYSTEM_PERSONA,
  };
}

function formatPropertyBlurb(p, index) {
  const uni = p.university?.name || 'campus';
  const reasons = (p.matchReasons || []).slice(0, 3).join('; ');
  const caveats = [];
  if (p.verification?.status !== 'verified') caveats.push('not fully verified yet — prefer verified alternatives when possible');
  if (p.fraudScore > 40) caveats.push('possible risk signals — review carefully and avoid off-platform payments');
  const caveatText = caveats.length ? ` Caveats: ${caveats.join('; ')}.` : '';
  return `${index + 1}. ${p.title} — KSh ${Number(p.rent).toLocaleString()}/mo near ${uni} (relevance ${p.aiScore}/100). Strengths: ${reasons}.${caveatText}`;
}

async function chatAssistant(message, context = {}) {
  const sessionId = context.sessionId || context.userId || 'anon';
  const memory = getSession(sessionId);
  const parsedPreview = parseNaturalLanguageQuery(message, memory);

  if (parsedPreview.intent === 'greeting') return greetingReply(message);
  if (parsedPreview.intent === 'farewell') return farewellReply();
  if (parsedPreview.intent === 'thanks') return thanksReply();
  if (parsedPreview.intent === 'about') return aboutReply();
  if (parsedPreview.intent === 'help') return helpReply();
  if (parsedPreview.intent === 'how_it_works') return howItWorksReply();
  if (parsedPreview.intent === 'app_help') return appHelpReply();
  if (parsedPreview.intent === 'marketplace') return marketplaceReply();
  if (parsedPreview.intent === 'landlord_help') return landlordHelpReply(message);
  if (parsedPreview.intent === 'admin_analytics') return adminAnalyticsReply();
  if (parsedPreview.intent === 'safety') return safetyReply();
  if (parsedPreview.intent === 'booking_help') return bookingHelpReply();
  if (parsedPreview.intent === 'roommate') return roommateReply();
  if (parsedPreview.intent === 'advice') return adviceReply(parsedPreview);

  const missing = missingEssentials(parsedPreview, message);
  if (missing.length === 2) {
    if (!/(find|need|looking|search|recommend|bedsitter|hostel|room|house|stay|accommodation)/i.test(message)) {
      return {
        reply: 'I am here to help with KampoStay. You can say hello, ask “what can you do?”, or search with something like “Bedsitter near JKUAT under KSh 8,000 with WiFi.”',
        suggestions: [],
        parsed: { ...parsedPreview, intent: 'clarify' },
        systemPersona: SYSTEM_PERSONA,
      };
    }
    return {
      reply: `Karibu — before I search live listings, please tell me ${missing.join(' and ')}. Example: "Bedsitter near JKUAT under KSh 8,000 with WiFi."`,
      suggestions: [],
      parsed: parsedPreview,
      systemPersona: SYSTEM_PERSONA,
    };
  }

  const searchResult = await searchWithAI(message, { ...context, sessionId });
  const top = searchResult.properties.slice(0, 3);
  const blurbs = top.map((p, i) => formatPropertyBlurb(p, i));

  let reply = searchResult.explanation;
  if (missing.length === 1) {
    reply = `I can refine this further if you also share ${missing[0]}.\n\n${reply}`;
  }
  if (blurbs.length) {
    reply += `\n\nTop recommendations (ranked for your needs):\n${blurbs.join('\n')}\n\nI can compare any two, filter verified-only options, estimate move-in costs, or guide you through M-Pesa booking.`;
  }

  return {
    reply,
    suggestions: top.map((p) => ({
      id: p._id,
      title: p.title,
      rent: p.rent,
      slug: p.slug,
      score: p.aiScore,
      reasons: p.matchReasons,
      verified: p.verification?.status === 'verified',
    })),
    parsed: searchResult.query,
    systemPersona: SYSTEM_PERSONA,
    persona: 'KampoStay AI',
  };
}

module.exports = {
  SYSTEM_PERSONA,
  parseNaturalLanguageQuery,
  searchWithAI,
  chatAssistant,
  scoreProperty,
};
