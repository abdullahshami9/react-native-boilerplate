const LocalAssets: { [key: string]: string } = {
    // Business & Startup
    'business_startup_growth': '/assets/Blues illustrations/Scenes/1x/Business, Startup, Growth, success _ build, idea, innovation, man, thought, grow, smart.png',
    'business_startup_workflow': '/assets/Blues illustrations/Scenes/1x/Business, Startup, workflow, error _ exhaustion, exhausted, work, laptop, computer, support.png',
    'business_support': '/assets/Blues illustrations/Scenes/1x/Business, Support, design, communication _ customer service, laptop, computer, messages, woman.png',
    'business_technology': '/assets/Blues illustrations/Scenes/1x/Business, Technology, startup _ account, preferences, user, profile, settings, woman, graph, analysis.png',
    'business_analytics_chart': '/assets/Blues illustrations/Scenes/1x/Business, analytics _ Chart, data, settings, image, picture, photo, gallery, woman.png',
    'business_analytics_success': '/assets/Blues illustrations/Scenes/1x/Business, analytics, sucess, startup, Technology _ account, setting, options, preferences.png',
    'business_finance_boss': '/assets/Blues illustrations/Scenes/1x/Business, finance _ boss, king, woman, account, graph, taxes, success, competition, manager.png',
    'business_workflow_meeting': '/assets/Blues illustrations/Scenes/1x/Business, workflow, cowormeeting, conversation, discussion, team work, man, woman.png',
    'workflow_business_busy': '/assets/Blues illustrations/Scenes/1x/workflow, business _ profile, woman, account, user, homework, tablet, busy.png',

    // Communication & Social
    'communication_mobile': '/assets/Blues illustrations/Scenes/1x/Communication _ smartphone, mobile, phone, city, buildings, message, text.png',
    'social_media_delivery': '/assets/Blues illustrations/Scenes/1x/Social media, Delivery, Business _ fast, speed, account, graph, success, happy.png',
    'social_media_selfie': '/assets/Blues illustrations/Scenes/1x/Social media, media _ selfie, like, man, picture, photo, smartphone, love, followers.png',
    'communication_social': '/assets/Blues illustrations/Scenes/1x/communication, business, social media _ messaging, message, smartphone, mobile, man.png',
    'social_startup': '/assets/Blues illustrations/Scenes/1x/social media, startup, communication _ laptop, computer, man, work, publish, followers.png',

    // Delivery & Transport
    'delivery_order': '/assets/Blues illustrations/Scenes/1x/Delivery _ order, account, transportation, subway, box, shopping.png',
    'delivery_truck': '/assets/Blues illustrations/Scenes/1x/Delivery, Business, Media _ multimedia, truck, woman, social media, running, speed.png',
    'transport_bike': '/assets/Blues illustrations/Scenes/1x/Transportation, Outdoor, Sport _ bike, bicycle, woman, happy, activity, race.png',
    'transport_scooter': '/assets/Blues illustrations/Scenes/1x/transportation _ scooter, speed, ddelivery, transport, timer, man, race, fast.png',
    'transport_vespa': '/assets/Blues illustrations/Scenes/1x/transportation, Delivery, outdoor _  bike, vespa, scooter, happy, man.png',

    // Shopping & E-commerce
    'shopping_fashion': '/assets/Blues illustrations/Scenes/1x/Shopping, e-commerce _ clothing, fashion, store, clothes, shop, woman, bill, list, invoice.png',
    'shopping_purchase': '/assets/Blues illustrations/Scenes/1x/Shopping, e-commerce _ purchase, shopping, shop, commerce, payment, store.png',
    'shopping_finance': '/assets/Blues illustrations/Scenes/1x/Shopping, e-commerce, finance _ store, online, shop, woman, invoice, fashion, purchase.png',
    'shopping_sale': '/assets/Blues illustrations/Scenes/1x/Shopping, e-commerce, sale _ store, shop, smartphone, discount, happy, savings, gift.png',
    'shopping_heavy': '/assets/Blues illustrations/Scenes/1x/shopping, e-commerce _ list, shop, commerce, gift, order, heavy.png',
    'privacy_shopping': '/assets/Blues illustrations/Scenes/1x/Privacy, Shopping _ online, store, shop, clothing, clothes, man, fashion, secret, spy.png',

    // Food & Leisure
    'food_butcher': '/assets/Blues illustrations/Scenes/1x/Food _ butcher, meat, cook, man, profession, occupation, cooking, meal, dinner.png',
    'leisure_drinking': '/assets/Blues illustrations/Scenes/1x/Leisure _ drinking, alcohol, hangover, woman, bottle, energy, drink, beverage .png',
    'leisure_relax': '/assets/Blues illustrations/Scenes/1x/Leisure, Success _ relax, sit, relaxing, man, city, building, happy.png',
    'leisure_elderly': '/assets/Blues illustrations/Scenes/1x/leisure _ elderly, old, elder, man, furniture, home, slow, relax.png',
    'music_guitar': '/assets/Blues illustrations/Scenes/1x/Music, leisure _ guitar, instrument, hobby, activity, woman, happy, relax, tunes, play.png',
    'outdoor_beach': '/assets/Blues illustrations/Scenes/1x/Outdoor, leisure _ beach, holiday, sun, holiday, vacation, woman, tanning, happy, swim, bikini.png',
    'outdoor_rain': '/assets/Blues illustrations/Scenes/1x/Outdoor, weather _  forecast, rain, forecast, umbrella, raining, man, walk, cold.png',

    // Medical & Pets
    'medical_doctor': '/assets/Blues illustrations/Scenes/1x/Medical, profession _ doctor, hospital, healthcare, health, man, care, report, treatment.png',
    'pet_dog_training': '/assets/Blues illustrations/Scenes/1x/Pet, Animal _ dog, training, love, care, woman, home, girl, happy, leisure.png',
    'pet_care': '/assets/Blues illustrations/Scenes/1x/Pets, Animal _ Care, happy, dog, woman, home, plant, petting, friend.png',

    // Sports & Fitness
    'sport_tennis': '/assets/Blues illustrations/Scenes/1x/Sport _  tennis, player, game, win, activity, winner, woman, success, happy.png',
    'sport_baseball': '/assets/Blues illustrations/Scenes/1x/Sport _ baseball, player, game, winner, trophy, man, win, success.png',
    'sport_basketball': '/assets/Blues illustrations/Scenes/1x/Sport _ basketball, player, game, activity, man, score, jump, winner.png',
    'sport_running': '/assets/Blues illustrations/Scenes/1x/Sport _ running, activity, fitness, sports, man, speed, fast.png',
    'sport_surf': '/assets/Blues illustrations/Scenes/1x/Sport,  outdoor _ surfboard, woman, surfer, activity, hobby, beach, happy, run.png',
    'sport_yoga': '/assets/Blues illustrations/Scenes/1x/Sport, Leisure _ yoga, exercise, activity, hobby, woman, workout, train, training, health.png',
    'sport_fishing': '/assets/Blues illustrations/Scenes/1x/Sport, Outdoor _ fishing, boat, hobby, activity, man, fish, target, win, adventure.png',
    'sport_soccer': '/assets/Blues illustrations/Scenes/1x/Sport, Outdoor _ soccer, football, game, activity, man, running, play.png',
    'sport_meditation': '/assets/Blues illustrations/Scenes/1x/Sport, leisure _ meditating, meditation, woman, relax, yoga, practice, focus.png',

    // Misc
    'success_trophy': '/assets/Blues illustrations/Scenes/1x/Success, Growth _ goals, achievement, target, trophy, reward, award, excercise.png',
    'emotion_tired': '/assets/Blues illustrations/Scenes/1x/Emotion _ exhausted, tired, sleepy, woman, home, bedroom, sleep.png',
};

export default LocalAssets;

export const AssetCategories = {
    Business: ['business_startup_growth', 'business_startup_workflow', 'business_finance_boss', 'business_workflow_meeting'],
    Technology: ['business_technology', 'social_startup', 'business_support', 'business_analytics_chart'],
    Shopping: ['shopping_fashion', 'shopping_purchase', 'shopping_sale', 'delivery_order'],
    Food: ['food_butcher', 'leisure_drinking'],
    Sports: ['sport_soccer', 'sport_basketball', 'sport_tennis', 'sport_running', 'sport_yoga'],
    Leisure: ['music_guitar', 'outdoor_beach', 'leisure_relax', 'pet_dog_training'],
    Transport: ['transport_vespa', 'transport_bike', 'delivery_truck'],
    Medical: ['medical_doctor'],
    Success: ['success_trophy', 'business_analytics_success']
};
