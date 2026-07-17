/**
 * @file factCheck.js
 * @description PIB-style Misinformation Firewall for HealthBot.
 *              Contains a curated local database of common Indian health myths
 *              and a keyword-matching engine to detect misinformation in user queries.
 *
 *              Inspired by PIB (Press Information Bureau) fact-check initiatives
 *              and WHO myth-busters for the Indian context.
 *
 * @see https://factcheck.pib.gov.in/
 */

// ─────────────────────────── Myth Database ───────────────────────────

/**
 * Local database of common Indian health myths with debunking information.
 * Each entry has:
 *   - id: Unique identifier
 *   - keywords: Array of trigger phrases (lowercase) for matching
 *   - myth: The false claim
 *   - fact: Evidence-based correction
 *   - source: Authoritative reference
 */
const MYTH_DATABASE = [
    {
        id: "myth_001",
        keywords: ["cow urine", "gaumutra", "gomutra", "cow urine cure", "gaumutra cure"],
        myth: "Drinking cow urine cures cancer and other diseases.",
        fact: "There is NO scientific evidence that cow urine has any curative properties against cancer or any other disease. Consuming animal urine can lead to infections and toxicity.",
        source: "Indian Council of Medical Research (ICMR); WHO"
    },
    {
        id: "myth_002",
        keywords: ["tulsi cure covid", "tulsi cures corona", "tulsi coronavirus", "basil cure covid"],
        myth: "Tulsi (Holy Basil) can cure COVID-19.",
        fact: "While tulsi has some anti-inflammatory and antioxidant properties, it CANNOT cure or prevent COVID-19. Vaccination and medical treatment are the only proven approaches.",
        source: "Ministry of AYUSH (Official Clarification); WHO"
    },
    {
        id: "myth_003",
        keywords: ["cold water cause cold", "cold water cold", "thanda pani sardi", "cold drink cold"],
        myth: "Drinking cold water causes cold or flu.",
        fact: "Colds are caused by viruses (rhinovirus, etc.), not by cold water. Drinking cold water does not weaken immunity or cause viral infections.",
        source: "NIH (National Institutes of Health); ICMR"
    },
    {
        id: "myth_004",
        keywords: ["antibiotics viral", "antibiotics flu", "antibiotics cold", "antibiotics for virus"],
        myth: "Antibiotics can cure viral infections like flu or common cold.",
        fact: "Antibiotics ONLY work against bacterial infections. Using antibiotics for viral infections contributes to antibiotic resistance, a major global health threat.",
        source: "WHO; ICMR Guidelines on Antimicrobial Resistance"
    },
    {
        id: "myth_005",
        keywords: ["vaccine autism", "vaccination autism", "vaccine cause autism", "mmr autism"],
        myth: "Vaccines cause autism in children.",
        fact: "This myth originated from a debunked and retracted 1998 study. Extensive global research involving millions of children has found NO link between vaccines and autism.",
        source: "WHO; CDC; The Lancet (Retraction Notice, 2010)"
    },
    {
        id: "myth_006",
        keywords: ["diabetes sugar only", "sugar cause diabetes", "meetha diabetes", "sweets diabetes only"],
        myth: "Eating too much sugar directly causes diabetes.",
        fact: "Type 1 diabetes is autoimmune. Type 2 diabetes is caused by a combination of genetic, lifestyle, and obesity factors — not sugar alone. However, excessive sugar intake contributes to obesity, which is a risk factor.",
        source: "American Diabetes Association; ICMR"
    },
    {
        id: "myth_007",
        keywords: ["5g corona", "5g covid", "5g virus", "5g spread corona", "5g cause covid"],
        myth: "5G mobile networks spread COVID-19.",
        fact: "Viruses cannot travel through radio waves or mobile networks. COVID-19 spread through respiratory droplets. 5G is a telecommunications technology unrelated to biology.",
        source: "WHO; Department of Telecommunications, India"
    },
    {
        id: "myth_008",
        keywords: ["lemon cure cancer", "nimbu cancer", "alkaline cure cancer", "alkaline body cancer"],
        myth: "Lemon or alkaline diets can cure cancer.",
        fact: "The body tightly regulates its pH. No food can significantly change blood pH. There is no scientific evidence that alkaline diets cure cancer. Seek oncological treatment.",
        source: "National Cancer Institute (NCI); AIIMS"
    },
    {
        id: "myth_009",
        keywords: ["corona hot water", "hot water kill corona", "garam pani corona", "steam kill covid"],
        myth: "Drinking hot water or inhaling steam kills the coronavirus.",
        fact: "While staying hydrated is good, hot water or steam inhalation does NOT kill the virus inside your body. The virus replicates in cells where temperature cannot be externally controlled.",
        source: "WHO Myth Busters; ICMR"
    },
    {
        id: "myth_010",
        keywords: ["giloy cure everything", "giloy immunity covid", "giloy liver damage"],
        myth: "Giloy (Tinospora cordifolia) boosts immunity enough to prevent all diseases.",
        fact: "While giloy is used in Ayurveda, overconsumption has been linked to liver damage (herb-induced liver injury). It should not replace prescribed medicines or vaccines.",
        source: "Journal of Clinical and Experimental Hepatology; AIIMS Delhi"
    },
    {
        id: "myth_011",
        keywords: ["homeopathy cure cancer", "homeopathy cancer", "homeopathy better allopathy"],
        myth: "Homeopathy can cure cancer and is better than modern medicine.",
        fact: "There is no scientific evidence that homeopathic preparations can cure cancer. Delaying evidence-based treatment in favor of unproven remedies can be life-threatening.",
        source: "National Health Service (NHS); ICMR"
    },
    {
        id: "myth_012",
        keywords: ["egg heat body", "anda garam", "egg cause heat", "egg summer avoid"],
        myth: "Eating eggs increases body heat and should be avoided in summer.",
        fact: "Eggs do not significantly increase body temperature. They are a rich source of protein and nutrients and can be consumed year-round as part of a balanced diet.",
        source: "National Institute of Nutrition (NIN), Hyderabad"
    },
    {
        id: "myth_013",
        keywords: ["periods pickle", "periods achar", "menstruation pickle spoil", "periods impure"],
        myth: "Women on their periods should not touch pickles or enter the kitchen because they are 'impure'.",
        fact: "Menstruation is a normal biological process. There is absolutely no scientific basis for restricting activities during periods. Such myths cause social stigma and harm.",
        source: "WHO; UNICEF; Ministry of Health & Family Welfare, India"
    },
    {
        id: "myth_014",
        keywords: ["dark skin unhealthy", "fair skin healthy", "gora healthy", "fairness health"],
        myth: "Fair skin means a person is healthier than someone with dark skin.",
        fact: "Skin color is determined by melanin and genetics. It has no correlation with health status. Health depends on nutrition, lifestyle, medical history — not skin color.",
        source: "Indian Journal of Dermatology; WHO"
    },
    {
        id: "myth_015",
        keywords: ["corona garlic", "garlic cure corona", "lehsun corona", "garlic prevent covid"],
        myth: "Eating garlic can prevent or cure COVID-19.",
        fact: "Garlic has some antimicrobial properties but there is NO evidence it can prevent or cure COVID-19. Follow WHO-recommended hygiene and vaccination protocols.",
        source: "WHO Myth Busters"
    },
    {
        id: "myth_016",
        keywords: ["insulin addiction", "insulin habit", "insulin dependency bad", "insulin avoid"],
        myth: "Taking insulin makes you addicted to it and should be avoided.",
        fact: "Insulin is a life-saving hormone therapy for diabetics. It is not addictive. Avoiding prescribed insulin can lead to dangerous complications including organ damage and death.",
        source: "American Diabetes Association; ICMR"
    },
    {
        id: "myth_017",
        keywords: ["curd cold night", "dahi raat", "curd night avoid", "yogurt cold"],
        myth: "Eating curd (yogurt) at night causes cold and respiratory problems.",
        fact: "There is no scientific evidence that curd at night causes cold. Curd is a probiotic and can be consumed at any time. Colds are caused by viruses, not by food timing.",
        source: "National Institute of Nutrition (NIN), Hyderabad"
    }
];

// ─────────────────────────── Core Engine ───────────────────────────

/**
 * Checks a user query against the local myth database using keyword matching.
 * Uses a scoring system — a myth is flagged only if enough keywords match.
 *
 * @param {string} query - The user's chat message or health question.
 * @returns {{ isMisinformation: boolean, myth?: string, fact?: string, source?: string, mythId?: string }}
 */
function checkForMisinformation(query) {
    if (!query || typeof query !== "string") {
        return { isMisinformation: false };
    }

    const normalizedQuery = query.toLowerCase().trim();

    let bestMatch = null;
    let bestScore = 0;

    for (const entry of MYTH_DATABASE) {
        let matchCount = 0;

        for (const keyword of entry.keywords) {
            if (normalizedQuery.includes(keyword)) {
                matchCount++;
            }
        }

        // Require at least one keyword match; prefer entries with more matches
        if (matchCount > 0 && matchCount > bestScore) {
            bestScore = matchCount;
            bestMatch = entry;
        }
    }

    if (bestMatch) {
        return {
            isMisinformation: true,
            mythId: bestMatch.id,
            myth: bestMatch.myth,
            fact: bestMatch.fact,
            source: bestMatch.source
        };
    }

    return { isMisinformation: false };
}

module.exports = {
    checkForMisinformation,
    MYTH_DATABASE // Exported for testing or admin inspection
};
