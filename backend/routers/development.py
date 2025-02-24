dictionary = {
    "name": "Apple Inc",
    "cusip": "037833100",
    "ticker": "AAPL",
    "ticker_str": "AAPL",
    "sector": "TECHNOLOGY",
    "industry": "ELECTRONIC COMPUTERS",
    "class": "COM",
    "shares_held": 300000000,
    "shares_held_str": "300,000,000",
    "market_value": 69900000000,
    "market_value_str": "$69,900,000,000",
    "sold": False,
    "update": True,
    "ratios": {
        "portfolio_percent": 0.26240817072226325,
        "portfolio_str": "0.26",
        "ownership_percent": 0.019846782836502205,
        "ownership_str": "0.02",
    },
    "records": {
        "first_appearance": "0000950123-24-011775",
        "last_appearance": "0000950123-24-011775",
    },
    "changes": {
        "value": {
            "action": "hold",
            "amount": -5226000000,
            "amount_str": "$-5,226,000,000",
            "gain": "N/A",
            "gain_str": "N/A",
            "loss": 5226000000,
            "loss_str": "$5,226,000,000",
        },
        "shares": {
            "action": "hold",
            "amount": 0,
            "amount_str": "0",
            "gain": "N/A",
            "gain_str": "N/A",
            "loss": "N/A",
            "loss_str": "N/A",
        },
    },
    "prices": {
        "buy": {
            "time": 1727668800,
            "time_str": "Q3 2024",
            "series": {
                "time": 1727654400,
                "open": 228.55,
                "close": 232.7436,
                "raw": 233,
                "high": 233.09,
                "low": 213.92,
                "volume": 1231814423,
                "dividend": 0,
            },
        },
        "sold": {"time": "N/A", "time_str": "N/A", "series": "N/A"},
    },
}


def serialize(dictionary):

    field_list = []

    def fields_recursion(value, trail=[]):

        for field in value:

            new_trail = trail
            new_value = value[field]

            if type(new_value) == dict:
                new_trail = new_trail + [field]
                fields_recursion(new_value, new_trail)
            else:
                field_list.append({"field": field, "trail": new_trail})

    fields_recursion(dictionary)

    duplicates_found = []
    field_count = {}

    for item in field_list:
        fid = item["field"]
        if fid not in field_count:
            field_count[fid] = []
        field_count[fid].append(item)

    for fid, items in field_count.items():
        if len(items) > 1:
            duplicates_found.extend(items)

    while len(duplicates_found) > 0:

        duplicate = duplicates_found.pop(0)

        field = duplicate["field"]
        trail = duplicate["trail"]

        trailing = trail[-1]
        new_trail = trail[:-1]
        new_field = f"{trailing}_{field}"

        for i, f in enumerate(field_list):
            if f == duplicate:
                field_list[i] = {"field": new_field, "trail": new_trail}


serialize(dictionary)
