type IString = {
    "Other": {
        "he": "他",
        "her": "她",
        "it": "它",
        "they": "他们"
    },
    "Activity": {
        [n in XSA_ActivityName_onlyName]: string
    }
}

type FirstStringKey = keyof IString;
type strKey<T extends FirstStringKey> = keyof IString[T];