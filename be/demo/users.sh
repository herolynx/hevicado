db.users.drop();

db.users.insert(
 {
    "_id" : ObjectId("546b8fd1ef660df8426005b7"),
    "first_name": "Johnny",
    "last_name": "Bravo",
    "email": "johnny.bravo@kunishu.com",
    "password": "78085654539db9c285fc239d02e15b55483ba831448f172c8adb702ef7ac0dbf",
    "phone": "+48 792 123 456",
    "role": "user",
    "profile":
        {
        "lang": "pl",
        "theme": "turquoise"
        }
 }
);

db.users.insert(
 {
    "_id" : ObjectId("546b8fd1ef660ff8426005b7"),
    "first_name": "Pamela",
    "last_name": "Anderson",
    "email": "pamela.anderson@kunishu.com",
    "password": "78085654539db9c285fc239d02e15b55483ba831448f172c8adb702ef7ac0dbf",
    "phone": "+48 792 123 456",
    "role": "user",
    "profile":
        {
        "lang": "pl",
        "theme": "turquoise"
        }
 }
);

db.users.insert(
 {
    "_id" : ObjectId("546b8fd1ef660df8426005b6"),
    "degree": "$$degree-6",
    "first_name": "Zbigniew",
    "last_name": "Religa",
    "email": "zbigniew.religa@kunishu.com",
    "password": "78085654539db9c285fc239d02e15b55483ba831448f172c8adb702ef7ac0dbf",
    "phone": "+48 792-321-654",
    "role": "doctor",
    "profile":
        {
        "lang": "pl",
        "theme": "turquoise"
        },
     "locations" : [
        {
            "_id" : ObjectId("546b8fd1ef660df8426005b8"),
            "name" : "Pulsantis",
            "specializations" : ["$$spec-15", "$$spec-18"],
            "address" : {
                "street" : "Grabiszynska 8/4",
                "city" : "Wrocław",
                "country" : "Poland"
            },
            "color" : "orange",
            "working_hours" : [
                {
                    "day" : "Monday",
                    "start" : "08:00",
                    "end" : "14:00",
                    "tzOffset" : 120
                },
                {
                    "day" : "Tuesday",
                    "start" : "10:00",
                    "end" : "16:00",
                    "tzOffset" : 120
                },
                {
                    "day" : "Wednesday",
                    "start" : "02:00",
                    "end" : "04:00",
                    "tzOffset" : 120
                }
            ],
            templates: [
                        {
                            _id: ObjectId("546c1fd1ef660df8526005b1"),
                            name: "$$temp-1",
                            description: "Details go here...",
                            durations: [30, 60]
                        },
                       {
                            _id: ObjectId("546c1fd1ef660df8526005b2"),
                            name: "$$temp-2",
                            description: "Details go here...",
                            durations: [30]
                        }
            ]
        },
        {
            "_id" : ObjectId("546b8fd1ef660df8526005b8"),
            "name" : "LuxMed",
            "specializations" : ["$$spec-24", "$$spec-25"],
            "address" : {
                "street" : "Plac Dominikanski",
                "city" : "Wrocław",
                "country" : "Poland"
            },
            "color" : "blue",
            "working_hours" : [
                {
                    "day" : "Wednesday",
                    "start" : "10:00",
                    "end" : "18:00",
                    "tzOffset" : 120
                },
                {
                    "day" : "Thursday",
                    "start" : "08:00",
                    "end" : "16:00",
                    "tzOffset" : 120
                }
            ],
            templates: [
                        {
                            _id: ObjectId("546c2fd1ef660df8526005b1"),
                            name: "$$temp-2",
                            description: "Details go here...",
                            durations: [30, 60]
                        },
                       {
                            _id: ObjectId("546c2fd1ef660df8526005b2"),
                            name: "$$temp-3",
                            description: "Details go here...",
                            durations: [30]
                        }
            ]
        }
     ],
     "description" : "  Lorem ipsum dolor sit amet, consectetur adipiscing elit."
 }
);

db.users.insert(
 {
    "_id" : ObjectId("546b8fd1ef660ff8426005b6"),
    "degree": "$$degree-6",
    "first_name": "Michaela",
    "last_name": "Quin",
    "email": "michaela.quin@kunishu.com",
    "password": "78085654539db9c285fc239d02e15b55483ba831448f172c8adb702ef7ac0dbf",
    "phone": "+48 792-321-654",
    "role": "doctor",
    "profile":
        {
        "lang": "pl",
        "theme": "turquoise"
        },
     "locations" : [
        {
            "_id" : ObjectId("546b8fd1ef660df8426005b8"),
            "name" : "Pulsantis",
            "specializations" : ["$$spec-18"],
            "address" : {
                "street" : "Grabiszynska 8/4",
                "city" : "Wrocław",
                "country" : "Poland"
            },
            "color" : "orange",
            "working_hours" : [
                {
                    "day" : "Monday",
                    "start" : "08:00",
                    "end" : "14:00",
                    "tzOffset" : 120
                },
                {
                    "day" : "Tuesday",
                    "start" : "10:00",
                    "end" : "16:00",
                    "tzOffset" : 120
                }
            ],
            templates: [
                        {
                            _id: ObjectId("546c1fd1ef660df8526005b1"),
                            name: "$$temp-1",
                            description: "Details go here...",
                            durations: [30, 60]
                        },
                       {
                            _id: ObjectId("546c1fd1ef660df8526005b2"),
                            name: "$$temp-2",
                            description: "Details go here...",
                            durations: [30]
                        }
            ]
        }
     ],
     "description" : "I am what I am"
 }
);

db.users.insert(
 {
    "_id" : ObjectId("546b8fd1ef660ff8426005b8"),
    "first_name": "Michal",
    "last_name": "Wrona",
    "email": "michal.robert.wronski@gmail.com",
    "password": "78085654539db9c285fc239d02e15b55483ba831448f172c8adb702ef7ac0dbf",
    "phone": "+48 792 123 456",
    "role": "user",
    "profile":
        {
        "lang": "pl",
        "theme": "turquoise"
        }
 }
);