-- Seed data — overeenkomstig met mock-data.ts
-- Voer uit na schema.sql

insert into locaties values
  ('marsdijk',    'Sporthal De Marsdijk',     'Assen',  'Wisselmarke 1, 9405 KA Assen',         3),
  ('palet',       'Sporthal Het Palet',        'Vries',  'De Fledders 17, 9481 AD Vries',         2),
  ('boerhoorn',   'MFA De Boerhoorn',          'Rolde',  'Schoolstraat 5, 9451 AX Rolde',         2),
  ('kloosterveen','Sportcentrum Kloosterveen', 'Assen',  'Het Vaartveld 2, 9408 BR Assen',        3),
  ('peelo',       'Sporthal Peelo',            'Assen',  'Vivaldistraat 2, 9402 HV Assen',        2),
  ('demarke',     'Sporthal De Marke',         'Beilen', 'De Vorrelvenne 8, 9411 JE Beilen',      2),
  ('norg',        'Sporthal De Huurne',        'Norg',   'Langeloërweg 22, 9331 BC Norg',         1),
  ('smilde',      'MFC De Spil',               'Smilde', 'Hoofdweg 9, 9422 AB Smilde',             2);

insert into competities values
  ('mix2526', 'Mix Competitie', 'mix', 'enkel', '2025–2026', '2025-09-01', '2026-06-30');

insert into poules values
  ('A', 'Poule A', 'Niveau 1 · gevorderd', 'mix2526'),
  ('B', 'Poule B', 'Niveau 2 · midden',    'mix2526'),
  ('C', 'Poule C', 'Niveau 3 · instap',    'mix2526');

insert into teams values
  ('vries1',  'Set Up Vries 1',  'SUV', 'Vries',  'Brinkweg 14, 9481 BG Vries',             212, 'A', 'palet',        'maandag',  '20:00', 'Mark Holtkamp',  '06-12345678', 'mark@setupvries.nl'),
  ('assen2',  'VV Assen Mix 2',  'VVA', 'Assen',  'Stationsstraat 88, 9401 KZ Assen',       28,  'A', 'marsdijk',     'dinsdag',  '20:15', 'Sanne de Vries', '06-23456789', 'sanne@vvassen.nl'),
  ('rolde',   'Rolder Smashers', 'ROL', 'Rolde',  '',                                       265, 'A', 'boerhoorn',    'woensdag', '20:00', 'Jeroen Bakker',  '06-34567890', 'jeroen@roldersmashers.nl'),
  ('kloos1',  'Kloosterveen 1',  'KLV', 'Assen',  '',                                       150, 'A', 'kloosterveen', 'donderdag','20:30', 'Lisa Pol',       '06-45678901', 'lisa@kloosterveenvc.nl'),
  ('peelo',   'Peelo Power',     'PEE', 'Assen',  '',                                       330, 'A', 'peelo',        'dinsdag',  '19:30', 'Tim Wolters',    '06-56789012', 'tim@peelopower.nl'),
  ('smilde',  'Smilde Smash',    'SMI', 'Smilde', '',                                       48,  'A', 'smilde',       'maandag',  '20:00', 'Karin Smit',     '06-67890123', 'karin@smildesmash.nl'),
  ('norg',    'Norg Net Zes',    'NOR', 'Norg',   '',                                       188, 'A', 'norg',         'woensdag', '20:15', 'Peter Hof',      '06-78901234', 'peter@norgnetzes.nl'),
  ('beilen3', 'Beiler Bal 3',    'BB3', 'Beilen', '',                                       96,  'A', 'demarke',      'donderdag','20:00', 'Anouk Veen',     '06-89012345', 'anouk@beilerbal.nl'),
  ('vries2',  'Set Up Vries 2',  'SU2', 'Vries',  '',                                       212, 'B', 'palet',        'maandag',  '21:00', 'Bram Dijk',      '06-11112222', 'bram@setupvries.nl'),
  ('assen3',  'VV Assen Mix 3',  'VA3', 'Assen',  '',                                       28,  'B', 'marsdijk',     'dinsdag',  '21:15', 'Eva Mulder',     '06-22223333', 'eva@vvassen.nl'),
  ('gieten',  'Gieten Gym',      'GIE', 'Gieten', '',                                       300, 'B', 'boerhoorn',    'woensdag', '19:30', 'Ruben Kok',      '06-33334444', 'ruben@gietengym.nl'),
  ('loon',    'Loon Lobs',       'LOO', 'Loon',   '',                                       128, 'B', 'peelo',        'donderdag','20:00', 'Femke Boer',     '06-44445555', 'femke@loonlobs.nl');

insert into wedstrijden (id, poule_id, thuis_id, uit_id, datum, tijd, locatie_id, status, uitslag_thuis, uitslag_uit) values
  ('w01','A','vries1', 'norg',    '2026-03-02','20:00','palet',        'gespeeld',3,1),
  ('w02','A','rolde',  'beilen3', '2026-03-04','20:00','boerhoorn',    'gespeeld',3,0),
  ('w03','A','peelo',  'kloos1',  '2026-03-03','19:30','peelo',        'gespeeld',1,3),
  ('w04','A','smilde', 'assen2',  '2026-03-02','20:00','smilde',       'gespeeld',2,3),
  ('w05','A','assen2', 'rolde',   '2026-03-10','20:15','marsdijk',     'gespeeld',null,null),
  ('w06','A','assen2', 'vries1',  '2026-03-17','20:15','marsdijk',     'gepland', null,null),
  ('w07','A','kloos1', 'norg',    '2026-03-19','20:30','kloosterveen', 'gepland', null,null),
  ('w08','A','rolde',  'peelo',   '2026-03-18','20:00','boerhoorn',    'gepland', null,null),
  ('w09','A','smilde', 'beilen3', '2026-03-16','20:00','smilde',       'verzoek', null,null),
  ('w10','A','norg',   'vries1',  '2026-03-25','20:15','norg',         'gepland', null,null),
  ('w11','A','beilen3','assen2',  '2026-03-26','20:00','demarke',      'gepland', null,null),
  ('w12','A','peelo',  'smilde',  '2026-03-24','19:30','peelo',        'gepland', null,null),
  ('w13','A','norg',   'assen2',  '2026-04-01','20:15','norg',         'verzoek', null,null),
  ('w20','B','vries2', 'gieten',  '2026-03-09','21:00','palet',        'gespeeld',3,1),
  ('w21','B','loon',   'assen3',  '2026-03-19','20:00','peelo',        'gepland', null,null);

insert into verplaatsverzoeken (wedstrijd_id, door_team_id, aan_team_id, reden, nieuwe_datum, nieuwe_tijd) values
  ('w09','beilen3','smilde','Te weinig spelers beschikbaar (vakantie)','2026-03-30','20:00'),
  ('w13','norg',   'assen2','Hal niet beschikbaar i.v.m. onderhoud',  '2026-04-08','20:15');

insert into standen values
  ('vries1', 'A',10,8,2,27,11,27),
  ('rolde',  'A',10,7,3,25,14,25),
  ('assen2', 'A',10,6,4,22,17,22),
  ('kloos1', 'A',10,6,4,21,18,21),
  ('peelo',  'A',10,5,5,19,19,19),
  ('smilde', 'A',10,4,6,16,22,16),
  ('norg',   'A',10,2,8,12,26,12),
  ('beilen3','A',10,2,8,11,27,11),
  ('vries2', 'B',6,5,1,16,6, 16),
  ('loon',   'B',6,4,2,14,9, 14),
  ('assen3', 'B',6,2,4,10,13,10),
  ('gieten', 'B',6,1,5,7, 19,7);

insert into blokkades (team_id, van, tot, reden) values
  ('assen2','2026-04-25','2026-05-10','Meivakantie');
