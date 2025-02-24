// Base questions
export const questions = [
    {
        id: 'Q2',
        text: 'Do you own or rent your home?',
        type: 'single',
        options: [
            { value: 'a', text: 'I own my home' },
            { value: 'b', text: 'I rent my home' },
            { value: 'c', text: 'Other (e.g., landlord, property manager)' }
        ]
    },
    {
        id: 'Q3',
        text: 'Which of the following energy upgrades are you interested in? (Select all that apply)',
        type: 'multi',
        options: [
            { value: 'all', text: 'All options' },
            { value: 'none', text: 'None' },
            { value: 'a', text: 'Attic, roof, or ceiling insulation' },
            { value: 'b', text: 'Wall insulation' },
            { value: 'c', text: 'Floor, basement, or crawlspace insulation' },
            { value: 'd', text: 'Rim/Band Joist Insulation' },
            { value: 'e', text: 'Air sealing (around windows, doors, etc.)' },
            { value: 'f', text: 'Duct sealing' },
            { value: 'g', text: 'Window replacement' },
            { value: 'h', text: 'Door replacement' },
            { value: 'i', text: 'Heat pump water heater' },
            { value: 'j', text: 'Non-heat pump (electric resistance) water heater' },
            { value: 'k', text: 'Ducted air source heat pump (central system)' },
            { value: 'l', text: 'Ductless air source heat pump (mini-split)' },
            { value: 'm', text: 'Air-to-water heat pump' },
            { value: 'n', text: 'Geothermal (ground source) heat pump' },
            { value: 'o', text: 'Electric stove or cooktop (induction)' },
            { value: 'p', text: 'Heat pump clothes dryer' },
            { value: 'q', text: 'Non-heat pump (electric resistance) clothes dryer' },
            { value: 'r', text: 'Smart thermostat' },
            { value: 's', text: 'Whole house fan' },
            { value: 't', text: 'Evaporative cooler (swamp cooler)' },
            { value: 'u', text: 'Electric vehicle charger (Level 2)' },
            { value: 'v', text: 'Electric vehicle charger (DC Fast Charger)' },
            { value: 'w', text: 'Electric vehicle (New)' },
            { value: 'x', text: 'Electric vehicle (Used)' },
            { value: 'y', text: 'E-bike or E-cargo bike' },
            { value: 'z', text: 'Electric outdoor equipment' },
            { value: 'aa', text: 'Battery storage installation' },
            { value: 'bb', text: 'Electric thermal storage (ETS) units or slab heating' },
            { value: 'cc', text: 'Energy Audit' },
            { value: 'dd', text: 'Electric panel upgrade' },
            { value: 'ee', text: 'Electric wiring upgrade' },
            { value: 'ff', text: 'Other electric service upgrades' },
            { value: 'gg', text: 'Adaptive e-bike' },
            { value: 'hh', text: 'Other weatherization (insulated shades etc.)' },
            { value: 'ii', text: 'Other' }
        ]
    },
    {
        id: 'Q4',
        text: 'Are you interested in rebates offered as point-of-sale discounts (instant rebates at the time of purchase)?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q5',
        text: 'Are you interested in rebates you apply for after purchase (mail-in or online rebates)?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q6',
        text: 'Are you interested in incentives applied as credits to your utility bill?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q7',
        text: 'Are you comfortable with receiving incentives as tax credits on your state income taxes?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q8',
        text: 'Are you interested in programs that offer free or heavily subsidized energy upgrades for income-qualified households?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Maybe' }
        ]
    },
    {
        id: 'Q9',
        text: 'Do you consider your household income to be low-to-moderate income for your area?',
        type: 'single',
        options: [
            { value: 'a', text: 'Yes' },
            { value: 'b', text: 'No' },
            { value: 'c', text: 'Unsure' }
        ]
    }
];

// Conditional questions
export const conditionalQuestions = {
    heat_pump: {
        id: 'Q10',
        text: 'What type of heat pump are you primarily interested in?',
        type: 'multi',
        options: [
            { value: 'a', text: 'Ducted (central system)' },
            { value: 'b', text: 'Ductless (mini-split)' },
            { value: 'c', text: 'Air-to-water heat pump' },
            { value: 'd', text: 'Geothermal (ground source) heat pump' },
            { value: 'e', text: 'Heat pump water heater' },
            { value: 'f', text: 'Heat pump clothes dryer' },
            { value: 'g', text: 'Other heat pump type' },
            { value: 'h', text: "I'm interested in all types of heat pumps" }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['k', 'l', 'm', 'n', 'i', 'p'].includes(upgrade));
        }
    },
    ev_charger: {
        id: 'Q11',
        text: 'What type of EV charger are you considering?',
        type: 'single',
        options: [
            { value: 'a', text: 'Level 2 Charger (240V)' },
            { value: 'b', text: 'DC Fast Charger' },
            { value: 'c', text: 'Vehicle-to-Building (V2B) Charger' },
            { value: 'd', text: 'Unsure' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['u', 'v'].includes(upgrade));
        }
    },
    ebike: {
        id: 'Q12',
        text: 'What type of e-bike are you considering?',
        type: 'single',
        options: [
            { value: 'a', text: 'Standard E-bike' },
            { value: 'b', text: 'E-cargo bike' },
            { value: 'c', text: 'Adaptive E-bike' },
            { value: 'd', text: 'Electric Motorcycle/Moped/UTV' },
            { value: 'e', text: 'Unsure' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.some(upgrade => ['y', 'gg'].includes(upgrade));
        }
    },
    outdoor_equipment: {
        id: 'Q13',
        text: 'What type of electric outdoor equipment are you interested in? (Select all that apply)',
        type: 'multi',
        options: [
            { value: 'a', text: 'Riding Lawn Mower' },
            { value: 'b', text: 'Walk-behind Lawn Mower' },
            { value: 'c', text: 'Single-stage Snow Blower' },
            { value: 'd', text: 'Two-stage Snow Blower' },
            { value: 'e', text: 'Chainsaw' },
            { value: 'f', text: 'Leaf Blower' },
            { value: 'g', text: 'Trimmer/Pruner' },
            { value: 'h', text: 'Power Washer' },
            { value: 'i', text: 'Additional Batteries for equipment' },
            { value: 'j', text: 'Other electric outdoor equipment' }
        ],
        showIf: (responses) => {
            const upgrades = responses.Q3 || [];
            return upgrades.includes('z');
        }
    }
};
