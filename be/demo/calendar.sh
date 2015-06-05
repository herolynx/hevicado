db.calendar.drop();

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005b9"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-1",
    "description" : "Dziwne swedzenie i piecze",
    "start" : ISODate("2014-12-02T07:00:00Z"),
    "end" : ISODate("2014-12-02T07:30:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b8"),
        "name" : "Pulsantis",
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
                "end" : "14:00"
            },
            {
                "day" : "Tuesday",
                "start" : "10:00",
                "end" : "16:00"
            }
        ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c0"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-2",
    "description" : "Szmery...",
    "start" : ISODate("2014-11-14T12:00:00Z"),
    "end" : ISODate("2014-11-14T14:30:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b8"),
        "name" : "Pulsantis",
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
                "end" : "14:00"
            },
            {
                "day" : "Tuesday",
                "start" : "10:00",
                "end" : "16:00"
            }
        ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c1"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-3",
    "description" : "Cos tam bedzie sie robic",
    "start" : ISODate("2014-12-18T12:00:00Z"),
    "end" : ISODate("2014-12-18T14:30:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b8"),
        "name" : "Pulsantis",
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
                "end" : "14:00"
            },
            {
                "day" : "Tuesday",
                "start" : "10:00",
                "end" : "16:00"
            }
        ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c2"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-1",
    "description" : "Ta wizyta sie nie odbyla",
    "start" : ISODate("2014-09-03T13:00:00Z"),
    "end" : ISODate("2014-09-03T13:30:00Z"),
    "cancelled" : ISODate("2014-09-02T18:28:37Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b8"),
        "name" : "Pulsantis",
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
                "end" : "14:00"
            },
            {
                "day" : "Tuesday",
                "start" : "10:00",
                "end" : "16:00"
            }
        ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c3"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-2",
    "description" : "Dziala kalendarz doktora",
    "start" : ISODate("2014-12-06T03:00:00Z"),
    "end" : ISODate("2014-12-06T04:30:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
            "_id" : ObjectId("546b8fd1ef660df8526005b8"),
            "name" : "LuxMed",
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
                    "end" : "18:00"
                },
                {
                    "day" : "Thursday",
                    "start" : "08:00",
                    "end" : "16:00"
                }
            ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c5"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-3",
    "description" : "Odbior badan",
    "start" : ISODate("2014-12-06T08:00:00Z"),
    "end" : ISODate("2014-12-06T08:15:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b8"),
        "name" : "Pulsantis",
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
                "end" : "14:00"
            },
            {
                "day" : "Tuesday",
                "start" : "10:00",
                "end" : "16:00"
            }
        ]
    }
  }
);

db.calendar.insert(
  {
    "_id" : ObjectId("546b8fd1ef660df8426005c4"),
    "doctor" : {
        "_id" : ObjectId("546b8fd1ef660df8426005b6"),
        "first_name" : "Zbigniew",
        "last_name" : "Religa",
        "degree": "$$degree-6",
        "email" : "zbigniew.religa@kunishu.com",
        "phone" : "+48 792-321-654"
    },
    "title" : "$$temp-3",
    "description" : "Opis badania...",
    "start" : ISODate("2014-12-07T05:00:00Z"),
    "end" : ISODate("2014-12-07T05:45:00Z"),
    "patient" : {
            "_id" : ObjectId("546b8fd1ef660df8426005b7"),
            "first_name" : "Johnny",
            "last_name" : "Bravo",
            "email" : "johnny.bravo@kunishu.com",
            "phone" : "+48 792 123 456"
    },
    "location" : {
            "_id" : ObjectId("546b8fd1ef660df8526005b8"),
            "name" : "LuxMed",
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
                    "end" : "18:00"
                },
                {
                    "day" : "Thursday",
                    "start" : "08:00",
                    "end" : "16:00"
                }
            ]
    }
  }
);