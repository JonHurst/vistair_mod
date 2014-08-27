var ntc = {
    title: "Notices to Crew",
    "EZY-ALL-NTC": {title:"Flight Crew NTC", order:10, type:"pdf"},
    "EZY-ALL-NTCA": {title:"Flight Crew Admin NTC", order:20, type:"pdf"},
    "EZY-ALL-NTCC": {title:"Cabin Crew NTC", order:30, type:"pdf"},
    "EZY-ALL-NTCC2": {title:"Cabin Crew Admin NTC", order:40, type:"pdf"}
};

var ezy_manuals = {
    title: "easyJet Manuals",
    "EZY-ALL-A-JUN14": {title:"General/Basic (Part A) (after 2014-06-14)", order:10},
    "EZY-A3XX-B-JUN14": {title:"Airbus A320 Family (Part B) (after 2014-06-14)", order:20},
    "EZY-ALL-C-JUN14": {title:"Route and Aerodrome (Part C)", order:30},
    "EZY-ALL-CSPM-SEP14": {title:"Cabin Safety Procedures (after 2014-09-14)", order:40},
    "EZY-ALL-ABS": {title:"Aerodrome Briefing Supplement", order:50},
    "EZY-A3N-QRH-CWQR": {title:"Cold Weather Quick Reference", order:60, type:"pdf"},
    "EZY-A3N-QRH-SI": {title:"QRH Supplementary", order:70, type:"pdf"},
    "EZY-ALL-A_old": {title:"General/Basic (Part A) (until 2014-06-14)", order:110},
    "EZY-A3XX-B_old": {title:"Airbus A320 Family (Part B) (until 2014-06-14)", order:120},
    "EZY-ALL-CSPM": {title:"Cabin Safety Procedures (until 2014-09-14)", order:150}
};

var airbus_manuals = {
    title: "Airbus Manuals",
    "EZY-A3N-FCOM": {title:"Flight Crew Operations Manual", order:10},
    "EZY-A3N-MEL": {title:"Minimum Equipment List", order:20},
    "EZY-A3N-FCTM": {title:"Flight Crew Training Manual", order:30},
    "EZY-A3N-QRH": {title:"Quick Reference Handbook", order:40},
    "EZY-A319-CDL": {title:"A319 Configuration Deviation List", order:70, type:"pdf"},
    "EZY-A320-CDL": {title:"A320 Configuration Deviation List", order:80, type:"pdf"}
};

var all_manuals = [
    ntc,
    ezy_manuals,
    airbus_manuals
];