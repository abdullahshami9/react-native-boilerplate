export const CardTemplates = {
    standard: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap');
                body { margin: 0; font-family: 'Poppins', sans-serif; background: #f0f0f0; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; padding: 25px; display: flex; position: relative; background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 20px; overflow: hidden; }

                .hologram { position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: linear-gradient(45deg, #00f260, #0575e6); border-radius: 50%; opacity: 0.1; filter: blur(30px); }
                .hologram2 { position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: linear-gradient(45deg, #ff0099, #493240); border-radius: 50%; opacity: 0.05; filter: blur(20px); }

                .logo { width: 60px; height: 60px; border-radius: 18px; background: #fff; margin-right: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); object-fit: cover; z-index: 2; }
                .info { flex: 1; z-index: 2; display: flex; flex-direction: column; justify-content: center; }
                .name { font-size: 22px; font-weight: 800; color: #1a202c; letter-spacing: -0.5px; }
                .role { font-size: 13px; color: #718096; margin-bottom: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
                .contact { font-size: 11px; color: #4a5568; line-height: 1.6; }
                .icon { margin-right: 5px; opacity: 0.7; }

                .card-back { background: #1a202c; color: white; justify-content: center; align-items: center; flex-direction: column; position: relative; }
                .card-back::before { content: ''; position: absolute; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.05; }
                .qr-container { padding: 8px; background: white; border-radius: 12px; box-shadow: 0 0 20px rgba(0,242,96,0.3); z-index: 2; }
                .scan-text { margin-top: 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #a0aec0; z-index: 2; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="hologram"></div>
                    <div class="hologram2"></div>
                    <img src="${data.logo}" class="logo" />
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">
                            📞 ${data.phone}<br/>
                            📧 ${data.email}<br/>
                            📍 ${data.address || 'Global Digital Nomad'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-container">
                        ${data.qrCode}
                    </div>
                    <div class="scan-text">Scan to Connect</div>
                </div>
            </div>
        </body>
        </html>
    `,
    broker: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap');
                body { margin: 0; font-family: 'Lato', sans-serif; background: #111; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .card { width: 350px; height: 200px; position: relative; background: linear-gradient(to bottom, #0f2027, #203a43, #2c5364); color: #fff; overflow: hidden; border: 1px solid #333; }

                .ticker { position: absolute; top: 10px; white-space: nowrap; font-family: monospace; color: #00ff00; font-size: 10px; animation: scroll 10s linear infinite; opacity: 0.8; }
                @keyframes scroll { from { transform: translateX(350px); } to { transform: translateX(-100%); } }

                .bull-bg { position: absolute; bottom: -20px; right: -20px; font-size: 120px; opacity: 0.1; color: #gold; }

                .content { padding: 30px 20px; z-index: 2; position: relative; }
                .name { font-family: 'Cinzel', serif; font-size: 22px; color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 5px; display: inline-block; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .role { font-size: 12px; letter-spacing: 1px; color: #ecf0f1; text-transform: uppercase; }
                .stats { display: flex; gap: 15px; margin-top: 20px; }
                .stat-box { background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.3); }
                .stat-label { font-size: 8px; color: #aaa; }
                .stat-val { font-size: 12px; color: #00ff00; font-weight: bold; }

                .card-back { background: #000; border: 1px solid #d4af37; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                .gold-border { padding: 5px; border: 2px solid #d4af37; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="ticker">AAPL ▲ 1.2%  TSLA ▼ 0.5%  BTC ▲ 5.4%  ETH ▲ 2.1%  GOLD ▲ 0.1%</div>
                    <div class="bull-bg">🐂</div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div style="font-size: 10px; margin-top: 5px; color: #ccc;">${data.phone} | ${data.email}</div>
                        <div class="stats">
                            <div class="stat-box">
                                <div class="stat-label">YIELD</div>
                                <div class="stat-val">+12.5%</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">RISK</div>
                                <div class="stat-val">LOW</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">TRUST</div>
                                <div class="stat-val">AAA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="gold-border" style="background: white;">${data.qrCode}</div>
                    <div style="margin-top: 15px; color: #d4af37; font-family: 'Cinzel', serif; letter-spacing: 2px;">INVEST IN SUCCESS</div>
                </div>
            </div>
        </body>
        </html>
    `,
    bakery: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;600&display=swap');
                body { margin: 0; font-family: 'Quicksand', sans-serif; background: #fff5eb; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                /* Biscuit Shape with texture */
                .card {
                    width: 350px; height: 200px;
                    background: #f3e5ab; /* Biscuit color */
                    background-image: radial-gradient(#d4a05f 15%, transparent 16%), radial-gradient(#d4a05f 15%, transparent 16%);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                    border-radius: 15px;
                    position: relative;
                    box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.2), 5px 5px 15px rgba(0,0,0,0.1);
                    border: 4px solid #d2691e;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0;
                    overflow: hidden;
                }

                .overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(255, 255, 255, 0.85);
                    z-index: 1;
                }

                .content { z-index: 2; padding: 25px; width: 60%; }
                .name { font-family: 'Pacifico', cursive; font-size: 26px; color: #8b4513; margin-bottom: 5px; text-shadow: 1px 1px 0px rgba(255,255,255,0.5); }
                .role { font-size: 14px; color: #d2691e; font-weight: 600; margin-bottom: 15px; }
                .contact { font-size: 11px; color: #5d4037; line-height: 1.5; }

                .nutrition-facts {
                    z-index: 2; width: 35%; height: 100%; border-left: 2px dashed #d2691e;
                    padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;
                }
                .fact-title { font-weight: 900; font-size: 12px; border-bottom: 2px solid #333; margin-bottom: 5px; }
                .fact-row { display: flex; justify-content: space-between; font-size: 9px; border-bottom: 1px solid #ddd; padding: 2px 0; }

                .card-back { background: #8b4513; color: white; flex-direction: column; justify-content: center; }
                .qr-bg { background: white; padding: 10px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="overlay"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">
                            🍩 ${data.phone}<br/>
                            🧁 ${data.email}<br/>
                            🥖 ${data.address || 'Freshly Baked Ideas'}
                        </div>
                    </div>
                    <div class="nutrition-facts">
                        <div class="fact-title">SKILL FACTS</div>
                        <div class="fact-row"><span>Creativity</span><span>100%</span></div>
                        <div class="fact-row"><span>Flavor</span><span>100%</span></div>
                        <div class="fact-row"><span>Passion</span><span>100%</span></div>
                        <div class="fact-row"><span>Bad Ideas</span><span>0%</span></div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back" style="background-image: none; border-color: #5d4037;">
                    <div class="qr-bg">${data.qrCode}</div>
                    <div style="margin-top: 15px; font-family: 'Pacifico'; font-size: 18px;">Scan for a treat!</div>
                </div>
            </div>
        </body>
        </html>
    `,
    dentist: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
                body { margin: 0; font-family: 'Montserrat', sans-serif; background: #e0f7fa; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; background: white; border-radius: 20px; overflow: hidden; position: relative; box-shadow: 0 5px 15px rgba(0,172,193,0.2); }

                .blue-wave { position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; background: #00acc1; border-radius: 100% 100% 0 0 / 20px 20px 0 0; transform: scaleX(1.5); }
                .tooth-bg { position: absolute; top: 10px; right: 20px; font-size: 120px; opacity: 0.05; color: #00acc1; }

                .content { padding: 30px; position: relative; z-index: 10; }
                .name { font-size: 22px; font-weight: 700; color: #006064; }
                .role { font-size: 12px; color: #0097a7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; font-weight: 500; }

                .checklist { display: flex; gap: 10px; margin-bottom: 15px; }
                .check-item { background: #e0f7fa; color: #006064; font-size: 9px; padding: 4px 8px; border-radius: 10px; font-weight: 600; }

                .contact { font-size: 11px; color: #555; }

                .card-back { background: #00acc1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .white-box { background: white; padding: 12px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="tooth-bg">🦷</div>
                    <div class="blue-wave"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="checklist">
                            <div class="check-item">✓ Whitening</div>
                            <div class="check-item">✓ Implants</div>
                            <div class="check-item">✓ Care</div>
                        </div>
                        <div class="contact">
                            📞 ${data.phone}<br/>
                            📧 ${data.email}
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="white-box">${data.qrCode}</div>
                    <div style="color: white; margin-top: 15px; font-weight: 600; letter-spacing: 1px;">BOOK YOUR SMILE</div>
                </div>
            </div>
        </body>
        </html>
    `,
    tech_terminal: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap');
                body { margin: 0; font-family: 'Fira Code', monospace; background: #000; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; background: #0d1117; border: 1px solid #30363d; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 255, 0, 0.1); }
                .header { background: #161b22; padding: 8px 15px; display: flex; align-items: center; border-bottom: 1px solid #30363d; }
                .dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
                .red { background: #ff5f56; }
                .yellow { background: #ffbd2e; }
                .green { background: #27c93f; }
                .title { color: #8b949e; font-size: 10px; margin-left: 10px; }

                .body { padding: 20px; color: #c9d1d9; font-size: 11px; line-height: 1.6; }
                .keyword { color: #ff7b72; }
                .func { color: #d2a8ff; }
                .string { color: #a5d6ff; }
                .comment { color: #8b949e; font-style: italic; }
                .cursor { display: inline-block; width: 8px; height: 14px; background: #58a6ff; animation: blink 1s step-end infinite; vertical-align: middle; }
                @keyframes blink { 50% { opacity: 0; } }

                .card-back { background: #0d1117; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .qr-border { border: 2px solid #58a6ff; padding: 5px; border-radius: 5px; box-shadow: 0 0 15px rgba(88, 166, 255, 0.4); background: white; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="header">
                        <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                        <div class="title">user_profile.js — bash</div>
                    </div>
                    <div class="body">
                        <span class="keyword">class</span> <span class="func">Developer</span> {<br/>
                        &nbsp;&nbsp;<span class="keyword">constructor</span>() {<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">this</span>.name = <span class="string">'${data.name}'</span>;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">this</span>.stack = [<span class="string">'React'</span>, <span class="string">'Node'</span>];<br/>
                        &nbsp;&nbsp;}<br/>
                        &nbsp;&nbsp;<span class="func">contact</span>() {<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span> <span class="string">'${data.email}'</span>;<br/>
                        &nbsp;&nbsp;}<br/>
                        }<br/>
                        <span class="comment">// Initializing connection...</span><span class="cursor"></span>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="qr-border">${data.qrCode}</div>
                    <div style="margin-top: 15px; color: #58a6ff; font-size: 12px;">$ git clone contact_info</div>
                </div>
            </div>
        </body>
        </html>
    `,
    mechanic_tool: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Roboto:wght@400;700&display=swap');
                body { margin: 0; font-family: 'Roboto', sans-serif; background: #888; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: linear-gradient(135deg, #d7d7d7 0%, #b0b0b0 50%, #d7d7d7 100%);
                    border-radius: 10px;
                    position: relative;
                    border: 1px solid #999;
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    padding: 20px;
                }
                /* Brushed metal texture overlay */
                .card::after {
                    content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('https://www.transparenttextures.com/patterns/brushed-alum.png');
                    opacity: 0.5; pointer-events: none;
                }

                .screw { width: 15px; height: 15px; background: radial-gradient(circle, #ddd 20%, #999 80%); border-radius: 50%; border: 1px solid #666; position: absolute; box-shadow: 1px 1px 2px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10; }
                .screw::before { content: ""; width: 80%; height: 2px; background: #666; transform: rotate(45deg); }
                .screw::after { content: ""; width: 80%; height: 2px; background: #666; transform: rotate(-45deg); position: absolute; }
                .tl { top: 10px; left: 10px; }
                .tr { top: 10px; right: 10px; }
                .bl { bottom: 10px; left: 10px; }
                .br { bottom: 10px; right: 10px; }

                .content { z-index: 5; margin-left: 20px; width: 100%; }
                .name { font-family: 'Russo One', sans-serif; font-size: 26px; color: #333; text-transform: uppercase; text-shadow: 1px 1px 0px white; letter-spacing: 1px; }
                .role { font-size: 14px; font-weight: bold; color: #c0392b; background: #fff; display: inline-block; padding: 2px 8px; transform: skew(-10deg); margin-bottom: 15px; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); }

                .service-list { font-size: 10px; color: #444; font-weight: 700; margin-bottom: 10px; }
                .contact-bar { background: #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 11px; display: inline-block; width: 90%; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5); }

                .card-back { background: #222; color: #fff; justify-content: center; align-items: center; flex-direction: column; background-image: radial-gradient(#333 15%, transparent 16%); background-size: 10px 10px; }
                .warning-stripe { width: 100%; height: 30px; background: repeating-linear-gradient(45deg, #f1c40f, #f1c40f 10px, #222 10px, #222 20px); position: absolute; bottom: 40px; opacity: 0.8; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="screw tl"></div><div class="screw tr"></div><div class="screw bl"></div><div class="screw br"></div>
                    <div class="content">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="service-list">ENGINE • SUSPENSION • BRAKES • TUNING</div>
                        <div class="contact-bar">
                            🔧 ${data.phone} &nbsp;&nbsp; ✉️ ${data.email}
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="warning-stripe" style="top: 20px; bottom: auto;"></div>
                    <div style="background: #fff; padding: 5px; border: 2px solid #f1c40f; border-radius: 5px; z-index: 10;">
                        ${data.qrCode}
                    </div>
                    <div style="margin-top: 15px; color: #f1c40f; font-family: 'Russo One'; z-index: 10; font-size: 16px;">SCAN FOR REPAIRS</div>
                    <div class="warning-stripe"></div>
                </div>
            </div>
        </body>
        </html>
    `,
    split_card: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
                body { margin: 0; font-family: 'Lato', sans-serif; background: #e0e0e0; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; display: flex; box-shadow: 0 10px 20px rgba(0,0,0,0.1); background: white; position: relative; }

                .left { width: 50%; background: #2c3e50; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; }
                .right { width: 50%; background: #ecf0f1; color: #2c3e50; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; }

                .tear-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 0; border-left: 3px dashed #95a5a6; transform: translateX(-1.5px); }
                .scissors { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 20px; background: white; border-radius: 50%; padding: 2px; color: #7f8c8d; }

                .name-lg { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .role-sm { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
                .contact-xs { font-size: 9px; line-height: 1.4; }

                .card-back { display: flex; }
                .qr-box { padding: 5px; background: white; border: 1px solid #ccc; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="left">
                        <div class="name-lg">Your<br/>Advocate</div>
                        <div class="role-sm">Fair Representation</div>
                        <div class="contact-xs">We protect your interests</div>
                    </div>
                    <div class="tear-line"></div>
                    <div class="scissors">✂</div>
                    <div class="right">
                        <div class="name-lg" style="color: #2c3e50;">${data.name}</div>
                        <div class="role-sm">${data.role}</div>
                        <div class="contact-xs">${data.phone}<br/>${data.email}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="left" style="background: #34495e;">
                        <div class="qr-box">${data.qrCode}</div>
                        <div style="margin-top: 10px; font-size: 9px;">Scan for Consultation</div>
                    </div>
                    <div class="tear-line" style="border-color: #7f8c8d;"></div>
                    <div class="right" style="background: #bdc3c7;">
                        <div class="qr-box">${data.qrCode}</div>
                        <div style="margin-top: 10px; font-size: 9px;">Scan for Contact</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    finger_play: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;600&display=swap');
                body { margin: 0; font-family: 'Raleway', sans-serif; background: #fff; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card {
                    width: 350px; height: 200px;
                    background: #a8e6cf; /* Mint green yoga mat color */
                    border-radius: 15px;
                    position: relative;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    /* Yoga Mat Texture */
                    background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }

                .mandala { position: absolute; width: 200px; height: 200px; opacity: 0.1; background: radial-gradient(circle, #fff, transparent); top: 0; left: 75px; }

                .name { font-size: 24px; font-weight: 600; color: #3b3b3b; margin-bottom: 5px; z-index: 2; }
                .role { font-size: 14px; color: #ff8b94; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; z-index: 2; }

                .pose-container { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: space-around; z-index: 2; }
                .pose { font-size: 24px; color: #3b3b3b; }

                .contact { font-size: 12px; color: #555; z-index: 2; }

                .card-back { background: #ff8b94; color: white; }
                .circle-qr { background: white; padding: 15px; border-radius: 50%; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="mandala"></div>
                    <div class="name">${data.name}</div>
                    <div class="role">${data.role}</div>
                    <div class="contact">
                        ${data.phone} • ${data.email}
                    </div>
                    <div class="pose-container">
                        <div class="pose">🧘</div>
                        <div class="pose">🌸</div>
                        <div class="pose">🕊️</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="circle-qr">${data.qrCode}</div>
                    <div style="margin-top: 15px; letter-spacing: 2px; font-size: 14px;">FIND YOUR BALANCE</div>
                </div>
            </div>
        </body>
        </html>
    `,
    chart_graph: (data: any) => `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Anton&family=Open+Sans&display=swap');
                body { margin: 0; font-family: 'Open Sans', sans-serif; background: #fff; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card-container { width: 350px; height: 200px; position: relative; }

                .card {
                    width: 100%; height: 100%;
                    background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    padding: 20px;
                    box-sizing: border-box;
                    /* Bar Chart Clip Path Shape */
                    clip-path: polygon(0 100%, 0 20%, 20% 20%, 20% 40%, 40% 40%, 40% 10%, 60% 10%, 60% 30%, 80% 30%, 80% 0, 100% 0, 100% 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }

                .bg-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; z-index: 0; pointer-events: none; }

                .content { z-index: 2; margin-bottom: 20px; }
                .name { font-family: 'Anton', sans-serif; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
                .role { font-size: 14px; font-weight: bold; margin-bottom: 10px; background: white; color: #00f2fe; padding: 2px 8px; display: inline-block; }
                .contact { font-size: 10px; line-height: 1.4; opacity: 0.9; }

                .arrow-up { position: absolute; top: 20px; right: 20px; font-size: 40px; color: rgba(255,255,255,0.5); }

                .card-back { background: #333; clip-path: polygon(0 100%, 0 20%, 20% 20%, 20% 40%, 40% 40%, 40% 10%, 60% 10%, 60% 30%, 80% 30%, 80% 0, 100% 0, 100% 100%); justify-content: center; align-items: center; display: flex; flex-direction: column; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card-container">
                    <div style="position: absolute; top: -20px; right: 0; color: #4facfe; font-size: 10px; font-weight: bold;">GROWTH TRAJECTORY</div>
                    <div class="card">
                        <div class="bg-grid"></div>
                        <div class="arrow-up">↗</div>
                        <div class="content">
                            <div class="name">${data.name}</div>
                            <div class="role">${data.role}</div>
                            <div class="contact">
                                ${data.phone}<br/>
                                ${data.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card-container">
                    <div class="card card-back">
                        <div style="background: white; padding: 8px; border-radius: 4px;">${data.qrCode}</div>
                        <div style="margin-top: 10px; font-size: 12px; font-weight: bold;">SCALE UP.</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
};
