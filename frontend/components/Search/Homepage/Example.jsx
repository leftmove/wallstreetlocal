import Link from "next/link";

import { cn } from "components/ui/utils";

export const examples = [
  {
    name: "Berkshire Hathaway Inc",
    cik: "1067983",
    lastReport: "0000950123-24-011775",
    tickers: ["BRK-B", "BRK-A"],
    marketValue: 266378900503.0,
    people: ["Warren Buffet"],
    date: "September 29, 2024",
    topHoldings: ["AXP", "AAPL", "BAC", "OXY"],
    holdings: [
      {
        name: "American Express Company",
        ticker: "AXP",
        cusip: "025816109",
        marketValue: 41116821840.0,
        portfolioPercent: 0.15435464957006584,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 69900000000.0,
        portfolioPercent: 0.26240817072226325,
      },
      {
        name: "Bank of America Corp",
        ticker: "BAC",
        cusip: "060505104",
        marketValue: 31652073622.0,
        portfolioPercent: 0.11882350126917628,
      },
      {
        name: "Occidental Petroleum Corporation",
        ticker: "OXY",
        cusip: "674599105",
        marketValue: 13157209747.0,
        portfolioPercent: 0.049392837503854106,
      },
      {
        name: "Chubb Ltd",
        ticker: "CB",
        cusip: "H1467J104",
        marketValue: 7796272968.0,
        portfolioPercent: 0.02926760698117754,
      },
      {
        name: "Citigroup Inc",
        ticker: "C",
        cusip: "172967424",
        marketValue: 3458324292.0,
        portfolioPercent: 0.012982726054765182,
      },
      {
        name: "Chevron Corp",
        ticker: "CVX",
        cusip: "166764100",
        marketValue: 17467773342.0,
        portfolioPercent: 0.06557491343727231,
      },
      {
        name: "The Coca-Cola Company",
        ticker: "KO",
        cusip: "191216100",
        marketValue: 28744000000.0,
        portfolioPercent: 0.10790644433820794,
      },
      {
        name: "DaVita HealthCare Partners Inc",
        ticker: "DVA",
        cusip: "23918K108",
        marketValue: 5917146790.0,
        portfolioPercent: 0.022213271317010185,
      },
      {
        name: "Kraft Heinz Co",
        ticker: "KHC",
        cusip: "500754106",
        marketValue: 11433038460.0,
        portfolioPercent: 0.04292021041610704,
      },
      {
        name: "Moodys Corporation",
        ticker: "MCO",
        cusip: "615369105",
        marketValue: 11708029942.0,
        portfolioPercent: 0.04395254248700581,
      },
    ],
  },
  {
    name: "Tiger Global Management LLC",
    cik: "1167483",
    lastReport: "0000919574-24-006690",
    tickers: [],
    marketValue: 23439074898.0,
    people: ["Chase Coleman", "Scott Shleifer"],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOGL", "META", "MSFT"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 1195397879.0,
        portfolioPercent: 0.0510002158447815,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 1709714480.0,
        portfolioPercent: 0.07294291636680106,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 4273344169.0,
        portfolioPercent: 0.18231710029497086,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 2299594200.0,
        portfolioPercent: 0.09810942667349977,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 1175970312.0,
        portfolioPercent: 0.05017136201481837,
      },
      {
        name: "Flutter Entertainment PLC",
        ticker: "FLTR.L",
        cusip: "G3643J108",
        marketValue: 801387574.0,
        portfolioPercent: 0.034190239055398065,
      },
      {
        name: "Apollo Global Management LLC Class A",
        ticker: "APO",
        cusip: "03769M106",
        marketValue: 1534543458.0,
        portfolioPercent: 0.06546945494555073,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 859184612.0,
        portfolioPercent: 0.03665608031626334,
      },
      {
        name: "Sea Ltd",
        ticker: "SE",
        cusip: "81141R100",
        marketValue: 1512377064.0,
        portfolioPercent: 0.06452375234864954,
      },
      {
        name: "Take-Two Interactive Software Inc",
        ticker: "TTWO",
        cusip: "874054109",
        marketValue: 897552040.0,
        portfolioPercent: 0.0382929805850224,
      },
      {
        name: "UnitedHealth Group Incorporated",
        ticker: "UNH",
        cusip: "91324P102",
        marketValue: 1383002072.0,
        portfolioPercent: 0.05900412358501437,
      },
    ],
  },
  {
    name: "Vanguard Group Inc",
    cik: "102909",
    lastReport: "0001752724-24-248565",
    tickers: [],
    marketValue: 5584478889705.0,
    people: [],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOG", "AVGO", "GOOGL"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 150130777633.0,
        portfolioPercent: 0.026883578682653172,
      },
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 68184633580.0,
        portfolioPercent: 0.012209668068707097,
      },
      {
        name: "Broadcom Inc",
        ticker: "AVGO",
        cusip: "11135F101",
        marketValue: 80826841330.0,
        portfolioPercent: 0.01447347960774003,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 82855792291.0,
        portfolioPercent: 0.01483679926586254,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 313761683784.0,
        portfolioPercent: 0.05618459483523528,
      },
      {
        name: "BERKSHIRE HATHAWAY INC-CL B",
        ticker: "BRK/B",
        cusip: "084670702",
        marketValue: 67402023175.0,
        portfolioPercent: 0.012069527794125212,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 108589264543.0,
        portfolioPercent: 0.019444833920526507,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 289867170227.0,
        portfolioPercent: 0.051905858353475165,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 260341476279.0,
        portfolioPercent: 0.04661875913953943,
      },
      {
        name: "Tesla Inc",
        ticker: "TSLA",
        cusip: "88160R101",
        marketValue: 62692143743.0,
        portfolioPercent: 0.011226140340251463,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 65358865354.0,
        portfolioPercent: 0.011703664145725257,
      },
    ],
  },
  {
    name: "Bridgewater Associates, LP",
    cik: "1350694",
    lastReport: "0001172661-24-004671",
    tickers: [],
    marketValue: 17658794959.0,
    people: ["Ray Dalio"],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOGL", "AAPL", "AMD"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 263031440.0,
        portfolioPercent: 0.014895208909254769,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 726313041.0,
        portfolioPercent: 0.04113038532280067,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 240422448.0,
        portfolioPercent: 0.013614884172912718,
      },
      {
        name: "Advanced Micro Devices Inc",
        ticker: "AMD",
        cusip: "007903107",
        marketValue: 240225754.0,
        portfolioPercent: 0.013603745587269888,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 459212513.0,
        portfolioPercent: 0.02600474800608958,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 374437593.0,
        portfolioPercent: 0.02120402858005686,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 577358670.0,
        portfolioPercent: 0.03269524740167747,
      },
      {
        name: "SPDR S&P 500 ETF Trust",
        ticker: "SPY",
        cusip: "78462F103",
        marketValue: 480217038.0,
        portfolioPercent: 0.027194213371578454,
      },
      {
        name: "Procter & Gamble Company",
        ticker: "PG",
        cusip: "742718109",
        marketValue: 277356938.0,
        portfolioPercent: 0.01570644761683707,
      },
      {
        name: "iShares Core MSCI Emerging Markets ETF",
        ticker: "IEMG",
        cusip: "46434G103",
        marketValue: 1020714091.0,
        portfolioPercent: 0.05780202405486235,
      },
      {
        name: "iShares Core S&P 500 ETF",
        ticker: "IVV",
        cusip: "464287200",
        marketValue: 1282175108.0,
        portfolioPercent: 0.07260830147113324,
      },
    ],
  },
  {
    name: "Pershing Square Capital Management, L.P.",
    cik: "1336528",
    lastReport: "0001172661-24-005218",
    tickers: [],
    marketValue: 12916077581.0,
    people: ["Bill Ackman"],
    date: "September 29, 2024",
    topHoldings: ["GOOG", "GOOGL", "BN", "CP.TO"],
    holdings: [
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 1261880235.0,
        portfolioPercent: 0.09769840937284782,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 661159035.0,
        portfolioPercent: 0.05118884048610764,
      },
      {
        name: "Brookfield Corp",
        ticker: "BN",
        cusip: "11271J107",
        marketValue: 1739912181.0,
        portfolioPercent: 0.13470902215386749,
      },
      {
        name: "Canadian Pacific Kansas City Ltd",
        ticker: "CP.TO",
        cusip: "13646K108",
        marketValue: 1272634267.0,
        portfolioPercent: 0.09853101756465828,
      },
      {
        name: "Chipotle Mexican Grill Inc",
        ticker: "CMG",
        cusip: "169656105",
        marketValue: 1660329807.0,
        portfolioPercent: 0.12854752509712414,
      },
      {
        name: "Hilton Worldwide Holdings Inc",
        ticker: "HLT",
        cusip: "43300A203",
        marketValue: 1698823724.0,
        portfolioPercent: 0.1315278352383876,
      },
      {
        name: "Howard Hughes Corporation",
        ticker: "HHH",
        cusip: "44267T102",
        marketValue: 1459715316.0,
        portfolioPercent: 0.11301537226342555,
      },
      {
        name: "Nike Inc",
        ticker: "NKE",
        cusip: "654106103",
        marketValue: 1439181879.0,
        portfolioPercent: 0.11142561431475811,
      },
      {
        name: "Restaurant Brands International Inc",
        ticker: "QSR",
        cusip: "76131D103",
        marketValue: 1658825918.0,
        portfolioPercent: 0.12843108967076744,
      },
      {
        name: "SEAPORT ENTMT GROUP INC",
        ticker: "NA",
        cusip: "812215101",
        marketValue: 6179285.0,
        portfolioPercent: 0.0004784180771018241,
      },
      {
        name: "Seaport Entertainment Group Inc",
        ticker: "SEG",
        cusip: "812215200",
        marketValue: 57435934.0,
        portfolioPercent: 0.004446855760954104,
      },
    ],
  },
  {
    name: "BlackRock Finance, Inc.",
    cik: "1364742",
    lastReport: "0001086364-24-008417",
    tickers: [],
    marketValue: 4418304733920.0,
    people: [],
    date: "June 29, 2024",
    topHoldings: ["AMZN", "GOOG", "AVGO", "GOOGL"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 125360342023.0,
        portfolioPercent: 0.02837295061623738,
      },
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 65174685236.0,
        portfolioPercent: 0.014751061586052223,
      },
      {
        name: "Broadcom Inc",
        ticker: "AVGO",
        cusip: "11135F101",
        marketValue: 54909661593.0,
        portfolioPercent: 0.012427766960357023,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 76700326355.0,
        portfolioPercent: 0.017359673217231912,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 222363339623.0,
        portfolioPercent: 0.05032775080357919,
      },
      {
        name: "BERKSHIRE HATHAWAY INC-CL B",
        ticker: "BRK/B",
        cusip: "084670702",
        marketValue: 43632181274.0,
        portfolioPercent: 0.009875321848904871,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 81262293039.0,
        portfolioPercent: 0.01839218839188184,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 247736163987.0,
        portfolioPercent: 0.05607041136956708,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 227480902640.0,
        portfolioPercent: 0.05148601473628434,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 59699575656.0,
        portfolioPercent: 0.013511873727875138,
      },
      {
        name: "JPMorgan Chase & Co",
        ticker: "JPM",
        cusip: "46625H100",
        marketValue: 40187045871.0,
        portfolioPercent: 0.009095580384593646,
      },
    ],
  },
  {
    name: "State Street Corp",
    cik: "93751",
    lastReport: "0000093751-24-000933",
    tickers: ["STT", "STT-PG"],
    marketValue: 2457609922723.0,
    people: [],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOG", "AVGO", "GOOGL"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 66926007537.0,
        portfolioPercent: 0.027232152229775687,
      },
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 31083169188.0,
        portfolioPercent: 0.012647722854878552,
      },
      {
        name: "Broadcom Inc",
        ticker: "AVGO",
        cusip: "11135F101",
        marketValue: 31814901743.0,
        portfolioPercent: 0.012945464391578261,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 36910837636.0,
        portfolioPercent: 0.01501899764267849,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 136074371716.0,
        portfolioPercent: 0.055368580041063375,
      },
      {
        name: "BERKSHIRE HATHAWAY INC-CL B",
        ticker: "BRK/B",
        cusip: "084670702",
        marketValue: 32449118886.0,
        portfolioPercent: 0.01320352696576306,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 48655131993.0,
        portfolioPercent: 0.019797743955676555,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 124572430905.0,
        portfolioPercent: 0.05068844724022572,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 114860105258.0,
        portfolioPercent: 0.04673650777367325,
      },
      {
        name: "Tesla Inc",
        ticker: "TSLA",
        cusip: "88160R101",
        marketValue: 29226475118.0,
        portfolioPercent: 0.011892235154070929,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 29991031357.0,
        portfolioPercent: 0.012203332628056094,
      },
    ],
  },
  {
    name: "JPMorgan Chase & Co",
    cik: "19617",
    lastReport: "0000019617-24-000652",
    tickers: [
      "JPM",
      "JPM-PC",
      "JPM-PD",
      "AMJB",
      "JPM-PJ",
      "JPM-PK",
      "JPM-PL",
      "JPM-PM",
    ],
    marketValue: 1311920220697.0,
    people: [],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOG", "AAPL", "META"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 33455840154.0,
        portfolioPercent: 0.025501428841629946,
      },
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 15778145929.0,
        portfolioPercent: 0.012026757176299448,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 41662588088.0,
        portfolioPercent: 0.03175695246610758,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 29862940347.0,
        portfolioPercent: 0.02276277160446109,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 59139099317.0,
        portfolioPercent: 0.04507827410845184,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 49390703882.0,
        portfolioPercent: 0.03764764282370737,
      },
      {
        name: "SPDR S&P 500 ETF Trust",
        ticker: "SPY",
        cusip: "78462F103",
        marketValue: 32519703965.0,
        portfolioPercent: 0.024787867015055882,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 16101416736.0,
        portfolioPercent: 0.012273167592039707,
      },
      {
        name: "UnitedHealth Group Incorporated",
        ticker: "UNH",
        cusip: "91324P102",
        marketValue: 15406483859.0,
        portfolioPercent: 0.011743460933024424,
      },
      {
        name: "Mastercard Inc",
        ticker: "MA",
        cusip: "57636Q104",
        marketValue: 14676864584.0,
        portfolioPercent: 0.011187314862943755,
      },
      {
        name: "Vanguard S&P 500 ETF",
        ticker: "VOO",
        cusip: "922908363",
        marketValue: 12624418755.0,
        portfolioPercent: 0.009622855533313504,
      },
    ],
  },
  {
    name: "Northern Trust Corp",
    cik: "73124",
    lastReport: "0001256484-24-000032",
    tickers: ["NTRS", "NTRSO"],
    marketValue: 610871342670.0,
    people: [],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "GOOG", "AVGO", "GOOGL"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 15865911366.0,
        portfolioPercent: 0.02597259072041779,
      },
      {
        name: "Alphabet Inc Class C",
        ticker: "GOOG",
        cusip: "02079K107",
        marketValue: 8222473919.0,
        portfolioPercent: 0.013460238424446568,
      },
      {
        name: "Broadcom Inc",
        ticker: "AVGO",
        cusip: "11135F101",
        marketValue: 7560403487.0,
        portfolioPercent: 0.012376425212475912,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 9864994171.0,
        portfolioPercent: 0.01614905378910398,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 35254311747.0,
        portfolioPercent: 0.057711516786677616,
      },
      {
        name: "BERKSHIRE HATHAWAY INC-CL B",
        ticker: "BRK/B",
        cusip: "084670702",
        marketValue: 7052584232.0,
        portfolioPercent: 0.011545122089333122,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 11825312678.0,
        portfolioPercent: 0.01935810677632029,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 31062184863.0,
        portfolioPercent: 0.05084898028975009,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 27953955063.0,
        portfolioPercent: 0.045760789728355386,
      },
      {
        name: "SPDR S&P 500 ETF Trust",
        ticker: "SPY",
        cusip: "78462F103",
        marketValue: 7700065754.0,
        portfolioPercent: 0.012605053169370342,
      },
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        cusip: "532457108",
        marketValue: 7303584819.0,
        portfolioPercent: 0.011956011534405018,
      },
    ],
  },
  {
    name: "Charles Schwab Investment Management Inc",
    cik: "884546",
    lastReport: "0001752724-24-247180",
    tickers: [],
    marketValue: 523952370188.0,
    people: [],
    date: "September 29, 2024",
    topHoldings: ["AMZN", "AVGO", "GOOGL", "AAPL"],
    holdings: [
      {
        name: "Amazon.com Inc",
        ticker: "AMZN",
        cusip: "023135106",
        marketValue: 10678217136.0,
        portfolioPercent: 0.020380129461325912,
      },
      {
        name: "Broadcom Inc",
        ticker: "AVGO",
        cusip: "11135F101",
        marketValue: 5519591235.0,
        portfolioPercent: 0.01053452861186506,
      },
      {
        name: "Alphabet Inc Class A",
        ticker: "GOOGL",
        cusip: "02079K305",
        marketValue: 6175106114.0,
        portfolioPercent: 0.011785624925762437,
      },
      {
        name: "Apple Inc",
        ticker: "AAPL",
        cusip: "037833100",
        marketValue: 22121656314.0,
        portfolioPercent: 0.04222073908371194,
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        cusip: "30303M102",
        marketValue: 7915451069.0,
        portfolioPercent: 0.015107195843316535,
      },
      {
        name: "Microsoft Corporation",
        ticker: "MSFT",
        cusip: "594918104",
        marketValue: 20322512858.0,
        portfolioPercent: 0.038786947085873574,
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        cusip: "67066G104",
        marketValue: 17738630335.0,
        portfolioPercent: 0.033855425310196,
      },
      {
        name: "Home Depot Inc",
        ticker: "HD",
        cusip: "437076102",
        marketValue: 5513335818.0,
        portfolioPercent: 0.010522589707957143,
      },
      {
        name: "Vanguard Mortgage-Backed Securities ETF",
        ticker: "VMBS",
        cusip: "92206C771",
        marketValue: 5696588953.0,
        portfolioPercent: 0.010872341222458828,
      },
      {
        name: "Schwab Fundamental U.S. Large Company ETF",
        ticker: "FNDX",
        cusip: "808524771",
        marketValue: 9373603705.0,
        portfolioPercent: 0.017890182845506825,
      },
      {
        name: "Schwab Fundamental U.S. Small Company ETF",
        ticker: "FNDA",
        cusip: "808524763",
        marketValue: 5882859391.0,
        portfolioPercent: 0.01122785147224196,
      },
    ],
  },
];

function Example({
  name,
  people,
  date,
  cik,
  tickers,
  marketValue,
  topHoldings,
  holdings,
  className,
}) {
  return (
    <div
      className={cn(
        " md:w-full p-4 transition-all duration-300 mt-4 border-2 bg-black-one rounded-md text-white-one border-white-one",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <Link href={`/filers/${cik}/overview`}>
          <h3 className="text-lg font-bold text-wrap">{name}</h3>
        </Link>
        <span className="hidden text-sm md:block">{date}</span>
        <Link href={`/filers/${cik}/overview`}>
          <span className="text-sm">{cik}</span>
        </Link>
      </div>
      <div className="flex justify-between ">
        <p className="text-sm ">{people.length ? people.join(", ") : ""}</p>
        <p className="text-sm">{tickers.length ? tickers.join(", ") : ""}</p>
      </div>
      <div className="flex justify-between px-4">
        <p className="text-sm text-wrap">${marketValue.toLocaleString()}</p>
        <p className="hidden text-sm md:block">{topHoldings.join(", ")}</p>
      </div>
      <div className="w-full mt-6 rounded">
        <table className="w-full overflow-x-auto border-none rounded-md bg-white-one">
          <thead className="text-xs text-black-one">
            <tr>
              <th className="w-2/12 p-1 border-2 border-opacity-30 border-black-one">
                Ticker
              </th>
              <th className="w-7/12 p-1 border-2 border-opacity-30 border-black-one">
                Market Value
              </th>
              <th className="w-3/12 p-1 border-2 border-opacity-30 border-black-one">
                Portfolio %
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-center text-black-one">
            {holdings
              .slice(0, Math.min(5, holdings.length))
              .map(({ ticker, marketValue, portfolioPercent }) => (
                <tr key={ticker}>
                  <td className="p-1 border-2 border-opacity-30 border-black-one">
                    {ticker}
                  </td>
                  <td className="p-1 border-2 border-opacity-30 border-black-one">
                    ${marketValue.toLocaleString()}
                  </td>
                  <td className="p-1 border-2 border-opacity-30 border-black-one">
                    {portfolioPercent.toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* <div className="flex flex-col items-center justify-center w-full">
          {examples
            .filter((e) => e.cik !== cik)
            .map((e) => (
              <span>{e.name}</span>
            ))}
        </div> */}
    </div>
  );
}

export default Example;
