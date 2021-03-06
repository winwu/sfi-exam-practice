import { IformatedQuestion } from '../helpers/data/index';

type questionList = 'market' | 'ethics';

type originalQuestion = {
    ans: number;
    qn: string | number;
    title: string;
    category: 'market' | 'ethics' | string;
}

interface IOption {
    val: number;
    text: string;
};

export const convertQuestionTitleToAnsMapping = (str: string) : {
    title: string;
    options: IOption[]
} | null => {
    // regex can't defined as global variable
    // please search "RegExp.exec() returns NULL sporadically"
    const regex: RegExp = /(.*?)\s*\(1\)(.*?)\s*\(2\)(.*?)\s*\(3\)(.*?)\s*\(4\)(.*?)\s*$/g;
    const match: RegExpExecArray | null = regex.exec(str);
    
    if (!Array.isArray(match)) {
        console.warn(`${str} is invalid question title format`);
        return null;
    }

    let options = [];
    let optionsCounter = 1;
    // index 2 ~ 5 means A, B, C, D
    for (let idx = 2; idx <= 5; idx++) {
        // remove \n
        // const text = match[idx].trim().replace(' ', '');
        const text = match[idx].trim();

        options.push({
            val: optionsCounter,
            text
        });
        optionsCounter++;
    }

    // const title = match[1].trim().replace(' ', '');
    const title = match[1].trim();

    return {
        title: title || 'no title',
        options
    };
}


export const formatJsonData = (datas: originalQuestion[]) : IformatedQuestion[] => {
    const result = datas.map((d) => {

        const trimedTitle = d.title.replace(/\n/g, '');

        return {
            ans: Math.abs(d.ans),
            qn: d.qn,
            category: d.category as 'market' | 'ethics',
            ...convertQuestionTitleToAnsMapping(trimedTitle)
        }
    });
    return result;
}   

export const getData = async (type: questionList) => {
    const response = await fetch(`${window.location.origin}/data/${type}_formated.json`);
    if (!response.ok) {
        throw new Error('An error has occured');
    }

    const datas = await response.json();
    return formatJsonData(datas);
}

export const getHistories = (type: questionList) => {
    const histories = JSON.parse(window.localStorage.getItem(`${type}-pra-history`) as string);
    if (!histories) {
        return null;
    }

    return histories;
}

export const getWrongQuestions = async (type: questionList) => {
    const allQuestion = await getData(type);

    const histories = getHistories(type);
    
    let pickedQuestions: IformatedQuestion[]= [];
    
    if (histories) {
        histories.forEach((h: null | string, index: number) => {
            if (h === "false") {
                pickedQuestions.push(allQuestion[index])
            }
        });
    }
    
    return pickedQuestions;
}

export const getBookmarks = () => {
    const bookmarks = JSON.parse(window.localStorage.getItem('bookmarks') as string);
    if (!bookmarks) {
        const defaultBookmark = {
            market: [],
            ethics: []
        };

        window.localStorage.setItem('bookmarks', JSON.stringify(defaultBookmark));

        return defaultBookmark;
    }
    return bookmarks;
}

export const setBookmark = (type: questionList, qn: number) => {
    const bookmarks = getBookmarks();
    
    if (!bookmarks[type].includes(qn)) {
        bookmarks[type].push(qn);
        bookmarks[type].sort((a: number, b: number) => a - b);
        window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
}

export const removeBookmark = (type: questionList, qn: number) => {
    const bookmarks = getBookmarks();
    
    let typeOfBookmarks = bookmarks[type];
    typeOfBookmarks = typeOfBookmarks.filter((q: number) => q !== qn);
    
    bookmarks[type] = typeOfBookmarks.sort((a: number, b: number) => a - b);
    
    window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

export const getIsBookmarked = (type: questionList, qn: number) => {
    const bookmarks = getBookmarks();
    return bookmarks[type] && bookmarks[type].includes(qn) ? true : false;
}

export const getBookmarkedList = async () => {
    const { market = [], ethics = [] } = getBookmarks();

    const marketQuestions: IformatedQuestion[] = await getData('market');
    const ethicsQuestions: IformatedQuestion[] = await getData('ethics');

    const filteredMarket = marketQuestions.filter((i: IformatedQuestion) => market.includes(i.qn));
    const filteredEthics = ethicsQuestions.filter((i: IformatedQuestion) => ethics.includes(i.qn));
    return [...filteredMarket, ...filteredEthics];
}

export const clean = () => {
    window.localStorage.clear();
    window.location.reload();
}