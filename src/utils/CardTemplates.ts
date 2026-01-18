export const CardTemplates = {
    mechanic_wrench: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Impact, sans-serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
                .cut-guide { border: 1px dashed #999; padding: 20px; border-radius: 60px 10px 10px 60px; position: relative; }
                .cut-label { position: absolute; top: -10px; right: 20px; font-size: 10px; background: white; padding: 0 5px; color: #666; font-family: Arial; }

                .card {
                    width: 350px; height: 120px;
                    background: linear-gradient(135deg, #dcdcdc 0%, #f1f1f1 50%, #b0b0b0 100%);
                    border-radius: 60px 10px 10px 60px;
                    display: flex; align-items: center;
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                    position: relative;
                    border: 1px solid #aaa;
                }

                .head-hole {
                    width: 50px; height: 50px;
                    background: white;
                    border-radius: 50%; /* Polygon would be better for hex, but circle is safe for wrench hole */
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    position: absolute; left: 20px; top: 35px;
                    border: 4px solid #999;
                    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.4);
                }

                .content { margin-left: 90px; }
                .name { font-size: 24px; text-transform: uppercase; color: #333; letter-spacing: 1px; }
                .role { font-size: 12px; color: #c0392b; text-transform: uppercase; }
                .contact { font-size: 10px; color: #555; font-family: Arial; margin-top: 5px; }

                .card-back { background: linear-gradient(135deg, #444 0%, #222 100%); color: white; justify-content: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="cut-guide">
                    <div class="cut-label">✂ CUT HERE</div>
                    <div class="card">
                        <div class="head-hole"></div>
                        <div class="content">
                            <div class="name">${data.name}</div>
                            <div class="role">${data.role}</div>
                            <div class="contact">${data.phone} • ${data.email}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="cut-guide">
                    <div class="card card-back">
                        <div class="head-hole" style="background: #333; border-color: #555;"></div>
                        <div style="margin-left: 90px; display: flex; align-items: center;">
                            <div style="background: white; padding: 5px; border-radius: 2px;">${data.qrCode}</div>
                            <div style="margin-left: 10px; font-family: Arial; font-size: 12px;">SCAN TO FIX</div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    weight_loss: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Arial, sans-serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card-container { width: 400px; height: 200px; display: flex; position: relative; border: 1px solid #eee; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

                .left-part {
                    width: 50%; height: 100%; background: #fdfbf7;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    position: relative;
                }
                .belly-graphic {
                    width: 120px; height: 80px; background: #e0c0a0;
                    border-radius: 0 50% 50% 0; /* Bulge shape */
                    margin-right: -20px; /* Push towards tear line */
                    display: flex; justify-content: center; align-items: center;
                    font-weight: bold; color: rgba(0,0,0,0.1); font-size: 40px;
                }

                .right-part {
                    width: 50%; height: 100%; background: #fff;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    z-index: 1;
                }

                .tear-line {
                    position: absolute; left: 50%; top: 0; bottom: 0;
                    border-left: 3px dashed #333;
                    width: 0;
                }
                .tear-label { position: absolute; top: 10px; left: 45%; background: white; font-size: 10px; font-weight: bold; }

                .name { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
                .role { font-size: 12px; color: #777; text-transform: uppercase; }
                .contact { font-size: 10px; margin-top: 10px; text-align: center; }

                .card-back { background: #333; color: white; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card-container">
                    <div class="left-part">
                        <div class="belly-graphic">BEFORE</div>
                        <div style="margin-top: 10px; font-weight: bold; font-size: 14px;">${data.name}</div>
                        <div style="font-size: 10px;">Personal Trainer</div>
                    </div>
                    <div class="tear-line"></div>
                    <div class="tear-label">TEAR OFF</div>
                    <div class="right-part">
                        <div style="font-size: 16px; font-weight: bold; color: #2ecc71;">AFTER</div>
                        <div class="name" style="margin-top: 20px;">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone}<br>${data.email}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card-container card-back">
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="background: white; padding: 10px;">${data.qrCode}</div>
                        <div style="margin-top: 10px;">TRANSFORM YOUR LIFE</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    divorce_lawyer: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Times New Roman', serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; display: flex; position: relative; background: #fffcf5; border: 1px solid #ddd; }

                .side { width: 50%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; text-align: center; }
                .left { border-right: 1px dashed transparent; } /* Spacer */

                .divider {
                    position: absolute; left: 50%; top: 0; bottom: 0;
                    border-left: 2px dashed #000;
                }

                .name { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
                .role { font-size: 10px; color: #555; text-transform: uppercase; }
                .contact { font-size: 9px; margin-top: 10px; }

                .card-back { background: #2c3e50; color: white; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="side">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="side">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.email}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="side" style="border-right: 1px dashed white;">
                        <div style="background: white; padding: 5px;">${data.qrCode}</div>
                    </div>
                    <div class="side">
                        <div style="background: white; padding: 5px;">${data.qrCode}</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    yoga_mat: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Arial, sans-serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .card { width: 350px; height: 200px; position: relative; border: 1px solid #eee; overflow: hidden; background: #f9f9f9; }

                .person-graphic {
                    position: absolute; bottom: 0; width: 100%; text-align: center;
                    font-size: 100px; line-height: 100px; color: #333;
                }
                /* Creating the "holes" visual guide */
                .hole {
                    width: 40px; height: 40px; border: 2px dashed #e91e63; border-radius: 50%;
                    position: absolute; bottom: 20px; background: white;
                    display: flex; justify-content: center; align-items: center;
                    font-size: 8px; color: #e91e63;
                }
                .hole-left { left: 110px; }
                .hole-right { right: 110px; }

                .info { position: absolute; top: 20px; width: 100%; text-align: center; }
                .name { font-size: 20px; font-weight: bold; color: #e91e63; }
                .role { font-size: 12px; color: #555; }
                .contact { font-size: 10px; margin-top: 5px; color: #777; }

                .card-back { background: #e91e63; color: white; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone} • ${data.email}</div>
                    </div>
                    <div style="position: absolute; bottom: 80px; width: 100%; text-align: center; font-size: 12px; color: #aaa;">
                        GET STRETCHY
                    </div>
                    <div class="hole hole-left">CUT</div>
                    <div class="hole hole-right">CUT</div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 10px; border-radius: 5px;">${data.qrCode}</div>
                    <div style="margin-top: 10px;">YOUR INSTRUCTOR</div>
                </div>
            </div>
        </body>
        </html>
    `,
    hair_stylist: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Courier New', monospace; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .cut-guide { border: 1px dashed #bbb; padding: 10px; border-radius: 10px; position: relative; }
                .cut-text { position: absolute; top: -10px; left: 10px; background: white; font-size: 10px; color: #999; }

                /* Scissors Shape Simulation */
                .card {
                    width: 350px; height: 150px;
                    background: linear-gradient(to right, #d7d2cc 0%, #304352 100%);
                    position: relative;
                    border-radius: 10px;
                    display: flex; align-items: center; padding: 20px; box-sizing: border-box;
                    color: white;
                }

                .handle-area {
                    width: 100px; height: 100%;
                    display: flex; flex-direction: column; justify-content: space-around; align-items: center;
                    border-right: 2px solid rgba(255,255,255,0.2);
                    margin-right: 20px;
                }

                .finger-hole {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: white; border: 4px solid #555;
                    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    font-size: 8px; color: #333; font-family: Arial;
                }

                .info-area { flex: 1; text-shadow: 1px 1px 2px black; }
                .name { font-size: 22px; font-weight: bold; }
                .role { font-size: 12px; opacity: 0.8; margin-bottom: 10px; }

                .card-back { background: #333; color: white; justify-content: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="cut-guide">
                    <div class="cut-text">✂ CUT SHAPE</div>
                    <div class="card">
                        <div class="handle-area">
                            <div class="finger-hole">CUT</div>
                            <div class="finger-hole">CUT</div>
                        </div>
                        <div class="info-area">
                            <div class="name">${data.name}</div>
                            <div class="role">${data.role}</div>
                            <div style="font-size: 10px;">${data.phone}</div>
                            <div style="font-size: 10px;">${data.email}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="cut-guide">
                    <div class="card card-back">
                         <div style="background: white; padding: 5px; border-radius: 5px;">${data.qrCode}</div>
                         <div style="margin-left: 20px;">STYLE & CUT</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    dentist_sleeve: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Arial, sans-serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                /* Layout for Sleeve and Insert on one page */
                .parts-container { width: 400px; display: flex; flex-direction: column; gap: 20px; }

                .part-label { font-size: 10px; color: #999; margin-bottom: 5px; text-transform: uppercase; }

                .sleeve {
                    width: 350px; height: 180px; background: #ffebee;
                    border: 1px solid #ffcdd2; border-radius: 10px;
                    position: relative; display: flex; align-items: center; padding: 20px;
                }
                .cavity-hole {
                    width: 60px; height: 60px; background: #333; border-radius: 50%;
                    position: absolute; right: 40px; top: 60px;
                    border: 2px dashed #fff;
                    display: flex; justify-content: center; align-items: center;
                    color: white; font-size: 8px; text-align: center;
                }

                .insert {
                    width: 330px; height: 160px; background: #e0f7fa;
                    border: 1px solid #b2ebf2; border-radius: 8px;
                    display: flex; align-items: center; padding: 20px;
                }

                .tooth-graphic { font-size: 40px; margin-right: 20px; }

                .name { font-size: 18px; color: #006064; font-weight: bold; }
                .role { font-size: 12px; color: #00838f; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="parts-container">
                    <div>
                        <div class="part-label">Part 1: The Sleeve (Cut out & Fold)</div>
                        <div class="sleeve">
                            <div style="font-size: 24px; color: #c62828;">Oh no! A Cavity?</div>
                            <div class="cavity-hole">CUT<br>OUT</div>
                        </div>
                    </div>
                    <div>
                        <div class="part-label">Part 2: The Insert (Slides inside)</div>
                        <div class="insert">
                            <div class="tooth-graphic">🦷</div>
                            <div>
                                <div class="name">${data.name}</div>
                                <div class="role">${data.role}</div>
                                <div style="font-size: 10px; margin-top: 5px;">${data.phone}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="parts-container">
                    <div style="background: #00acc1; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="background: white; padding: 10px; display: inline-block; border-radius: 5px;">${data.qrCode}</div>
                        <div style="margin-top: 10px;">Book an Appointment</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    stock_broker: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Arial Black', sans-serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                .cut-guide { width: 350px; height: 200px; border: 1px dashed #ddd; position: relative; padding: 10px; }

                .card {
                    width: 100%; height: 100%;
                    background: #2ecc71;
                    /* Jagged Graph Shape */
                    clip-path: polygon(0% 100%, 0% 50%, 15% 65%, 30% 30%, 45% 60%, 60% 20%, 75% 45%, 90% 10%, 100% 30%, 100% 100%);
                    color: white;
                    display: flex; flex-direction: column; justify-content: flex-end;
                    padding: 20px; box-sizing: border-box;
                }

                .line-guide {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    border-top: 2px dashed #aaa; opacity: 0.3;
                    pointer-events: none;
                    clip-path: polygon(0% 100%, 0% 50%, 15% 65%, 30% 30%, 45% 60%, 60% 20%, 75% 45%, 90% 10%, 100% 30%, 100% 100%);
                }

                .name { font-size: 20px; text-transform: uppercase; margin-bottom: 5px; }
                .role { font-size: 12px; font-family: Arial; margin-bottom: 10px; }
                .contact { font-size: 10px; font-family: Arial; }

                .buy-label { position: absolute; top: 10px; right: 10px; color: #27ae60; font-size: 10px; }

                .card-back { background: #27ae60; justify-content: center; align-items: center; display: flex; height: 100%; clip-path: polygon(0% 100%, 0% 50%, 15% 65%, 30% 30%, 45% 60%, 60% 20%, 75% 45%, 90% 10%, 100% 30%, 100% 100%); }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="cut-guide">
                    <span class="buy-label">✂ CUT ALONG GRAPH</span>
                    <div class="card">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div class="contact">${data.phone} • ${data.email}</div>
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="cut-guide">
                    <div class="card-back">
                        <div style="background: white; padding: 8px;">${data.qrCode}</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    tech_transparent: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: 'Courier New', monospace; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                /* Glass/Window Simulation */
                .card {
                    width: 350px; height: 200px;
                    background: #1e1e1e;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border: 1px solid #444;
                    display: flex; flex-direction: column;
                    overflow: hidden;
                }

                .title-bar {
                    height: 25px; background: #333;
                    display: flex; align-items: center; padding: 0 10px;
                    border-bottom: 1px solid #000;
                }
                .dots { display: flex; gap: 6px; }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                .red { background: #ff5f56; }
                .yellow { background: #ffbd2e; }
                .green { background: #27c93f; }

                .content { padding: 20px; color: #d4d4d4; font-size: 11px; line-height: 1.5; }

                .k { color: #569cd6; } /* keyword */
                .s { color: #ce9178; } /* string */
                .v { color: #9cdcfe; } /* variable */
                .c { color: #6a9955; } /* comment */

                .card-back { background: #252526; justify-content: center; align-items: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="title-bar">
                        <div class="dots">
                            <div class="dot red"></div>
                            <div class="dot yellow"></div>
                            <div class="dot green"></div>
                        </div>
                        <div style="margin-left: 10px; color: #aaa; font-size: 10px;">${data.role}.js</div>
                    </div>
                    <div class="content">
                        <span class="k">const</span> <span class="v">profile</span> = {<br>
                        &nbsp;&nbsp;name: <span class="s">"${data.name}"</span>,<br>
                        &nbsp;&nbsp;role: <span class="s">"${data.role}"</span>,<br>
                        &nbsp;&nbsp;contact: {<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;phone: <span class="s">"${data.phone}"</span>,<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;email: <span class="s">"${data.email}"</span><br>
                        &nbsp;&nbsp;},<br>
                        &nbsp;&nbsp;skills: [<span class="s">"FullStack"</span>, <span class="s">"Mobile"</span>]<br>
                        };
                    </div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div class="title-bar" style="width: 100%;">
                        <div class="dots"><div class="dot red"></div></div>
                    </div>
                    <div style="flex: 1; display: flex; justify-content: center; align-items: center; flex-direction: column;">
                         <div style="background: white; padding: 8px;">${data.qrCode}</div>
                         <div class="c" style="margin-top: 10px;">// Scan to connect</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `,
    bakery_biscuit: (data: any) => `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: Georgia, serif; background: white; }
                .page { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }

                /* Biscuit Texture Simulation */
                .card {
                    width: 350px; height: 200px;
                    background-color: #eecfa1;
                    /* Texture dots */
                    background-image: radial-gradient(#d2691e 15%, transparent 16%), radial-gradient(#d2691e 15%, transparent 16%);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;

                    /* Scalloped Edge Simulation using border-image or radial gradient mask.
                       Simple way: Dashed border with thick size */
                    border: 8px dashed #eecfa1;
                    box-shadow: 0 0 0 4px #eecfa1; /* smoothed outer */

                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                    color: #5d4037;
                }

                /* Inner content plate */
                .plate {
                    background: rgba(255,255,255,0.8);
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    width: 250px;
                }

                .name { font-size: 22px; font-weight: bold; color: #8d6e63; }
                .role { font-size: 14px; font-style: italic; margin-bottom: 10px; }
                .bite-mark {
                    width: 60px; height: 60px; background: white; border-radius: 50%;
                    position: absolute; top: -20px; right: -20px;
                    box-shadow: inset -2px -2px 5px rgba(0,0,0,0.1);
                }

                .card-back { background: #d7ccc8; display: flex; justify-content: center; align-items: center; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="card">
                    <div class="plate">
                        <div class="name">${data.name}</div>
                        <div class="role">${data.role}</div>
                        <div style="font-size: 11px;">${data.phone}<br>${data.email}</div>
                    </div>
                    <div class="bite-mark"></div>
                </div>
            </div>
            <div class="page">
                <div class="card card-back">
                    <div style="background: white; padding: 10px; border-radius: 5px;">${data.qrCode}</div>
                </div>
            </div>
        </body>
        </html>
    `
};
