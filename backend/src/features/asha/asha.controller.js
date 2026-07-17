/**
 * @file asha.controller.js
 * @description Express handlers for ASHA (Accredited Social Health Activist) worker
 *              specific endpoints. Provides curated maternal/infant health guidelines,
 *              the Indian national immunization schedule, and government health scheme
 *              eligibility checks.
 *
 *              Data sourced from:
 *              - Ministry of Health & Family Welfare (MoHFW)
 *              - National Health Mission (NHM)
 *              - Indian Academy of Pediatrics (IAP)
 */

// ─────────────────────── Static Data: Guidelines ───────────────────────

const MATERNAL_INFANT_GUIDELINES = [
    {
        category: "Antenatal Care (ANC)",
        guidelines: [
            "Register pregnancy within the first trimester at the nearest health facility.",
            "Ensure at least 4 ANC visits: 1st trimester, 4–6 months, 7–8 months, 9th month.",
            "Administer IFA (Iron-Folic Acid) tablets — one tablet daily for 180 days.",
            "Provide 2 doses of Tetanus Toxoid (TT) injection during pregnancy.",
            "Monitor weight gain, blood pressure, and hemoglobin at every visit.",
            "Counsel on danger signs: severe headache, blurred vision, vaginal bleeding, reduced fetal movement.",
            "Ensure institutional delivery — counsel against home deliveries.",
            "Promote calcium supplementation (500mg twice daily from 14 weeks)."
        ]
    },
    {
        category: "Postnatal Care (PNC)",
        guidelines: [
            "Visit mother and newborn within 24 hours of home delivery.",
            "Conduct 7 home visits: Day 3, 7, 14, 21, 28, 35, 42 after delivery.",
            "Ensure exclusive breastfeeding — no water, no other fluids for 6 months.",
            "Initiate breastfeeding within 1 hour of birth (colostrum is essential).",
            "Monitor for postpartum danger signs: excessive bleeding, fever, foul-smelling discharge.",
            "Counsel on family planning options after 6 weeks.",
            "Ensure the newborn is kept warm (Kangaroo Mother Care for low-birth-weight babies)."
        ]
    },
    {
        category: "Newborn Care",
        guidelines: [
            "Ensure clean cord care — apply nothing to the cord stump.",
            "Weigh the newborn within 24 hours; refer if < 2.5 kg.",
            "Monitor for danger signs: not feeding well, convulsions, fast breathing (>60/min), severe chest indrawing, high/low temperature.",
            "Ensure birth registration within 21 days.",
            "Administer OPV-0 and BCG at birth or first contact.",
            "Promote hygienic practices — handwashing before handling the baby."
        ]
    },
    {
        category: "Nutrition",
        guidelines: [
            "Start complementary feeding at 6 months — continue breastfeeding until 2 years.",
            "Provide vitamin A supplementation starting at 9 months.",
            "Monitor growth using the MCP (Mother and Child Protection) card.",
            "Refer severely malnourished children (MUAC < 11.5 cm) to NRC (Nutritional Rehabilitation Centre).",
            "Promote use of iodized salt in the household."
        ]
    }
];

// ─────────────────── Static Data: Vaccination Schedule ─────────────────

/**
 * National Immunization Schedule (NIS) of India.
 * Source: Ministry of Health & Family Welfare — Universal Immunization Programme (UIP).
 */
const VACCINATION_SCHEDULE = [
    { age: "At Birth", vaccines: ["BCG", "OPV-0 (Oral Polio Vaccine)", "Hepatitis B — Birth dose"] },
    { age: "6 Weeks", vaccines: ["OPV-1", "Pentavalent-1 (DPT+HepB+Hib)", "Rotavirus-1*", "fIPV-1 (Fractional Inactivated Polio Vaccine)", "PCV-1 (Pneumococcal Conjugate Vaccine)*"] },
    { age: "10 Weeks", vaccines: ["OPV-2", "Pentavalent-2", "Rotavirus-2*"] },
    { age: "14 Weeks", vaccines: ["OPV-3", "Pentavalent-3", "Rotavirus-3*", "fIPV-2", "PCV-2*"] },
    { age: "9 Months", vaccines: ["Measles/MR-1 (Measles-Rubella)", "Vitamin A — 1st dose", "JE-1 (Japanese Encephalitis)*", "PCV — Booster*"] },
    { age: "16–24 Months", vaccines: ["DPT — Booster-1", "Measles/MR-2", "OPV — Booster", "JE-2*", "Vitamin A — 2nd dose"] },
    { age: "5–6 Years", vaccines: ["DPT — Booster-2"] },
    { age: "10 Years", vaccines: ["TT-1 (Tetanus Toxoid)"] },
    { age: "16 Years", vaccines: ["TT-2"] },
    { note: "* Vaccines marked with * are given in selected states/districts as per government notification." }
];

// ─────────────────── Static Data: Government Schemes ───────────────────

const GOVERNMENT_SCHEMES = [
    {
        id: "pmjay",
        name: "PM-JAY (Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana)",
        description: "Health insurance cover of ₹5 lakh per family per year for secondary and tertiary hospitalization.",
        eligibilityRules: {
            maxIncomeCategory: "BPL / Deprived as per SECC data",
            ageRange: [0, 120],
            conditions: ["any"]
        },
        benefits: "₹5,00,000 per family per year. Covers 1,929+ treatment packages across 27 specialties.",
        website: "https://pmjay.gov.in/"
    },
    {
        id: "jssk",
        name: "JSSK (Janani Shishu Suraksha Karyakram)",
        description: "Free and cashless delivery services including C-section, treatment of sick newborns up to 30 days.",
        eligibilityRules: {
            gender: ["female"],
            conditions: ["pregnant", "postpartum", "newborn (up to 30 days)"],
            ageRange: [0, 120]
        },
        benefits: "Free delivery (normal + C-section), free medicines, diagnostics, diet, blood, transport.",
        website: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=377"
    },
    {
        id: "jsy",
        name: "JSY (Janani Suraksha Yojana)",
        description: "Cash incentive for institutional deliveries to promote safe motherhood.",
        eligibilityRules: {
            gender: ["female"],
            conditions: ["pregnant"],
            ageRange: [19, 49],
            maxIncomeCategory: "BPL"
        },
        benefits: "₹1,400 (rural) / ₹1,000 (urban) cash incentive for institutional delivery. ASHA receives ₹600/₹200.",
        website: "https://nhm.gov.in/"
    },
    {
        id: "pmmvy",
        name: "PMMVY (Pradhan Mantri Matru Vandana Yojana)",
        description: "Maternity benefit of ₹5,000 in three installments for the first living child.",
        eligibilityRules: {
            gender: ["female"],
            conditions: ["pregnant", "first_child"],
            ageRange: [19, 49]
        },
        benefits: "₹5,000 in 3 installments (₹1,000 + ₹2,000 + ₹2,000) linked to ANC registration, checkups, and child birth registration.",
        website: "https://pmmvy.wcd.gov.in/"
    },
    {
        id: "rbsk",
        name: "RBSK (Rashtriya Bal Swasthya Karyakram)",
        description: "Free health screening and early intervention for children aged 0–18 years.",
        eligibilityRules: {
            ageRange: [0, 18],
            conditions: ["any"]
        },
        benefits: "Screening for 4Ds — Defects at birth, Diseases, Deficiencies, Development delays. Free corrective surgeries.",
        website: "https://rbsk.gov.in/"
    },
    {
        id: "nikshay_poshan",
        name: "Nikshay Poshan Yojana",
        description: "Nutritional support of ₹500/month for TB patients during treatment.",
        eligibilityRules: {
            conditions: ["tuberculosis", "tb"],
            ageRange: [0, 120]
        },
        benefits: "₹500 per month via DBT for the entire duration of TB treatment.",
        website: "https://nikshay.in/"
    },
    {
        id: "ab_hwc",
        name: "Ayushman Bharat — Health & Wellness Centres (AB-HWC)",
        description: "Free comprehensive primary health care including maternal health, NCD screening, and essential medicines.",
        eligibilityRules: {
            conditions: ["any"],
            ageRange: [0, 120]
        },
        benefits: "Free OPD services, screening for hypertension/diabetes/cancer, teleconsultation, free essential drugs.",
        website: "https://ab-hwc.nhp.gov.in/"
    }
];

// ──────────────────────────── Controllers ────────────────────────────

/**
 * GET /api/asha/guidelines
 * Returns curated maternal and infant health guidelines for ASHA workers.
 */
exports.getGuidelines = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Maternal & Infant Health Guidelines (MoHFW / NHM)",
            totalCategories: MATERNAL_INFANT_GUIDELINES.length,
            guidelines: MATERNAL_INFANT_GUIDELINES
        });
    } catch (err) {
        console.error("ASHA getGuidelines error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * GET /api/asha/vaccination-schedule
 * Returns the Indian National Immunization Schedule (NIS).
 */
exports.getVaccinationSchedule = async (req, res) => {
    try {
        return res.status(200).json({
            message: "National Immunization Schedule (NIS) — Universal Immunization Programme, India",
            source: "Ministry of Health & Family Welfare",
            schedule: VACCINATION_SCHEDULE
        });
    } catch (err) {
        console.error("ASHA getVaccinationSchedule error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/asha/scheme-eligibility
 * Checks a patient's eligibility for government health schemes based on
 * age, income category, gender, and medical conditions.
 *
 * @param {object} req.body - { age: 25, gender: "female", incomeCategory: "BPL", conditions: ["pregnant"] }
 */
exports.checkSchemeEligibility = async (req, res) => {
    try {
        const { age, gender, incomeCategory, conditions } = req.body;

        if (age === undefined || age === null) {
            return res.status(400).json({ message: "Patient age is required." });
        }

        const patientAge = Number(age);
        const patientGender = (gender || "").toLowerCase();
        const patientConditions = (conditions || []).map(c => c.toLowerCase());
        const patientIncome = (incomeCategory || "").toUpperCase();

        const eligibleSchemes = [];

        for (const scheme of GOVERNMENT_SCHEMES) {
            const rules = scheme.eligibilityRules;
            let eligible = true;

            // Check age range
            if (rules.ageRange) {
                const [minAge, maxAge] = rules.ageRange;
                if (patientAge < minAge || patientAge > maxAge) {
                    eligible = false;
                }
            }

            // Check gender (if specified in rules)
            if (eligible && rules.gender && rules.gender.length > 0) {
                if (!rules.gender.includes(patientGender)) {
                    eligible = false;
                }
            }

            // Check income category (if specified in rules)
            if (eligible && rules.maxIncomeCategory) {
                if (patientIncome && patientIncome !== "BPL" && rules.maxIncomeCategory.includes("BPL")) {
                    eligible = false;
                }
            }

            // Check medical conditions (if not "any")
            if (eligible && rules.conditions && !rules.conditions.includes("any")) {
                const hasMatchingCondition = rules.conditions.some(rc =>
                    patientConditions.some(pc => pc.includes(rc) || rc.includes(pc))
                );
                if (!hasMatchingCondition && patientConditions.length > 0) {
                    eligible = false;
                }
            }

            if (eligible) {
                eligibleSchemes.push({
                    id: scheme.id,
                    name: scheme.name,
                    description: scheme.description,
                    benefits: scheme.benefits,
                    website: scheme.website
                });
            }
        }

        return res.status(200).json({
            message: `Found ${eligibleSchemes.length} eligible government health scheme(s).`,
            patient: { age: patientAge, gender: patientGender, incomeCategory: patientIncome, conditions: patientConditions },
            eligibleSchemes
        });
    } catch (err) {
        console.error("ASHA checkSchemeEligibility error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};
