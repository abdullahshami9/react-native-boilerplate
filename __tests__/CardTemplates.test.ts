import { CardTemplates } from '../src/utils/CardTemplates';

describe('CardTemplates', () => {
    const mockData = {
        name: 'John Doe',
        role: 'Developer',
        phone: '123-456-7890',
        email: 'john@example.com',
        address: '123 Main St',
        logo: 'http://example.com/logo.png',
        qrCode: '<img src="qr" />'
    };

    it('should generate standard template', () => {
        const html = CardTemplates.standard(mockData);
        expect(html).toContain('John Doe');
        expect(html).toContain('Developer');
    });

    it('should generate tech_terminal template', () => {
        const html = CardTemplates.tech_terminal(mockData);
        expect(html).toContain('const');
        expect(html).toContain('developer');
        expect(html).toContain('John Doe');
        expect(html).toContain('window-bar');
    });

    it('should generate mechanic_tool template', () => {
        const html = CardTemplates.mechanic_tool(mockData);
        expect(html).toContain('wrench-hole');
        expect(html).toContain('John Doe');
    });

    it('should generate split_card template', () => {
        const html = CardTemplates.split_card(mockData);
        expect(html).toContain('divider');
        expect(html).toContain('TEAR HERE');
    });

    it('should generate finger_play template', () => {
        const html = CardTemplates.finger_play(mockData);
        expect(html).toContain('finger-hole');
        expect(html).toContain('Insert fingers');
    });

    it('should generate chart_graph template', () => {
        const html = CardTemplates.chart_graph(mockData);
        expect(html).toContain('clip-path');
        expect(html).toContain('CUT THE GRAPH');
    });
});
