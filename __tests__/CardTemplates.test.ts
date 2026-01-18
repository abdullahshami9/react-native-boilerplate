import { CardTemplates } from '../src/utils/CardTemplates';

describe('CardTemplates', () => {
    const mockData = {
        name: 'John Doe',
        role: 'Professional',
        phone: '123-456-7890',
        email: 'john@example.com',
        qrCode: '<img src="qr.png" />',
        logo: 'logo.png'
    };

    test('should have 9 specific templates', () => {
        const keys = Object.keys(CardTemplates);
        const expectedKeys = [
            'mechanic_wrench',
            'weight_loss',
            'divorce_lawyer',
            'yoga_mat',
            'hair_stylist',
            'dentist_sleeve',
            'stock_broker',
            'tech_transparent',
            'bakery_biscuit'
        ];

        expectedKeys.forEach(key => {
            expect(keys).toContain(key);
        });
        expect(keys.length).toBe(9);
    });

    test('mechanic_wrench should render wrench elements', () => {
        const html = CardTemplates.mechanic_wrench(mockData);
        expect(html).toContain('SCAN TO FIX');
        expect(html).toContain('head-hole');
        expect(html).toContain('linear-gradient');
    });

    test('weight_loss should render before/after sections', () => {
        const html = CardTemplates.weight_loss(mockData);
        expect(html).toContain('BEFORE');
        expect(html).toContain('AFTER');
        expect(html).toContain('TEAR OFF');
    });

    test('divorce_lawyer should render split layout', () => {
        const html = CardTemplates.divorce_lawyer(mockData);
        expect(html).toContain('divider');
        expect(html).toContain('John Doe'); // name appears twice
    });

    test('yoga_mat should render finger holes', () => {
        const html = CardTemplates.yoga_mat(mockData);
        expect(html).toContain('hole-left');
        expect(html).toContain('GET STRETCHY');
    });

    test('hair_stylist should render scissors', () => {
        const html = CardTemplates.hair_stylist(mockData);
        expect(html).toContain('CUT SHAPE');
        expect(html).toContain('finger-hole');
    });

    test('dentist_sleeve should render sleeve and insert', () => {
        const html = CardTemplates.dentist_sleeve(mockData);
        expect(html).toContain('Part 1: The Sleeve');
        expect(html).toContain('Part 2: The Insert');
        expect(html).toContain('cavity-hole');
    });

    test('stock_broker should render graph clip-path', () => {
        const html = CardTemplates.stock_broker(mockData);
        expect(html).toContain('clip-path: polygon');
        expect(html).toContain('CUT ALONG GRAPH');
    });

    test('tech_transparent should render terminal window', () => {
        const html = CardTemplates.tech_transparent(mockData);
        expect(html).toContain('const</span> <span class="v">profile');
        expect(html).toContain('title-bar');
    });

    test('bakery_biscuit should render biscuit texture', () => {
        const html = CardTemplates.bakery_biscuit(mockData);
        expect(html).toContain('radial-gradient');
        expect(html).toContain('bite-mark');
    });
});
