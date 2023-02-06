/**
 * Return week number start of year
 * @param date 
 * @returns
 */
 const getWeekNumber = (date:Date):number => {
    const j1 = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - j1.getTime()) / 86400000) + j1.getDay() + 1) / 7);
}
/**
 * Declension
 * @param value 
 * @param words 
 * @returns 
 */
const nw = (value:number, words:string[]):string => {  
	value = Math.abs(value) % 100; 
	var num = value % 10;
	if(value > 10 && value < 20) return words[2]; 
	if(num > 1 && num < 5) return words[1];
	if(num == 1) return words[0]; 
	return words[2];
}
/**
 * Default translates for TOP2 internet languages
 */
const Translate = {
    en: {
        ago: 'ago',
        year: ['year', 'years', 'years'],
        month: ['month', 'months', 'months'],
        week: ['week', 'weeks', 'weeks'],
        day: ['day', 'days', 'days'],
        hour: ['hour', 'hours', 'hours'],
        minute: ['minute', 'minutes', 'minutes'],
    },
    ru: {
        ago: 'назад',
        year: ['год', 'года', 'лет'],
        month: ['месяц', 'месяца', 'месяцев'],
        week: ['неделя', 'недели', 'недель'],
        day: ['день', 'дня', 'дней'],
        hour: ['час', 'часа', 'часов'],
        minute: ['минута', 'минуты', 'минут'],
    }
};

interface TranslateDate {
    ago:string,
    year:string[], 
    month:string[], 
    week:string[], 
    day:string[], 
    hour:string[], 
    minute:string[], 
    second:string[], 
}
const DateViewFormat = 'date,time';
const DateDialogFormat = 'date,time,ago';

class WCTime extends HTMLTimeElement {
    Date:Date
    Inited:boolean
    FormatDate:string
    FormatTime:string
    ShowDialog:boolean
    ViewFormat:string
    DateDialog?:HTMLDialogElement
    DateViewFormat:string
    DateDialogFormat:string
    DateAsString:boolean
    DateHint:string
    DateCssHint:boolean
    ShowHintDialog:boolean
    defaultIntDateOptions:object
    Lang:string
    Translate:Function
    intl:Function
    constructor() {
        super();
        this.Inited = false;
        this.ShowDialog = (this.getAttribute('data-show-dialog') === '0') ? false : true;
        this.Lang = this.getAttribute('lang') || navigator.language.replace(/-\w{1,2}/gm, "");
        this.Translate = (phrase) => {
            return Translate[this.Lang || 'en'][phrase];
        };
        this.FormatDate = this.getAttribute('data-format-date') || "day,month,year";
        this.FormatTime = this.getAttribute('data-format-time') || "hour,minute";
        this.classList.add('wc-time');
    }
    static get observedAttributes() {
        return ['datetime'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'datetime') {
            this.Init();
        }
    }
    connectedCallback() {
        if(this.Inited === false) {
            this.Init();
            this.Inited = true;
        }
    }
    Init() {
        //setup properties
        this.DateDialogFormat = this.getAttribute('data-dialog-format') || DateDialogFormat;
        this.DateViewFormat = this.getAttribute('data-view-format') || DateViewFormat;
        this.ShowHintDialog = this.getAttribute('data-show-hint-in-dialog') === '1' || false;
        this.DateCssHint = this.getAttribute('data-css-hint') === '1' || false;
        this.DateHint = this.getAttribute('data-date-hint') || '';
        this.DateAsString = this.getAttribute('data-as-string') === '1' || false;
        this.Date = new Date(this.getAttribute('datetime') || Date.now());
        
        // prepare Intl.DateTimeFormat options
        const language = this.Lang;
        const defaultIntDateOptions = this.defaultIntDateOptions = {
            timeZone: this.getAttribute('data-format-timeZone') || Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour12: this.getAttribute('data-format-hour12') !== null || false,
            weekday: this.getAttribute('data-format-weekday') as "narrow" | "short" | "long" || 'long',
            era: this.getAttribute('data-format-era') as "narrow" | "short" | "long" || 'long',
            year: this.getAttribute('data-format-year') as "numeric" | "2-digit" || 'numeric',
            month: this.getAttribute('data-format-month') as "narrow" | "short" | "long" | "numeric" | "2-digit" || 'long',
            day: this.getAttribute('data-format-day') as  "numeric" | "2-digit" || 'numeric',
            hour: this.getAttribute('data-format-hour') as  "numeric" | "2-digit" || '2-digit',
            minute: this.getAttribute('data-format-minute') as  "numeric" | "2-digit" || '2-digit',
            second: this.getAttribute('data-format-second') as "numeric" | "2-digit" || '2-digit',
            timeZoneName: this.getAttribute('data-format-timeZoneName') as "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" || 'short',
        };
        this.intl =(propDateNames:string[], declension = false) => {
            let options = {};
            for (let i = 0; i < propDateNames.length; i++) {
                const propDateName = propDateNames[i];
                options[propDateName] = defaultIntDateOptions[propDateName];
                if(declension) {
                    if(propDateName === 'month') {
                        options['day'] = defaultIntDateOptions['day'];
                        return new Intl.DateTimeFormat([language, 'en'], options).format(this.Date).replace(/\d\d? /, '');
                    }
                }
                if(propDateName === 'era') {
                    options['year'] = 'numeric';
                }
            }
            return new Intl.DateTimeFormat([language, 'en'], options).format(this.Date);
        }
        
        //Listen pointer events in <time> element
        this.onpointerenter = (ev: PointerEvent) => this.showDateDialog();
        this.onpointercancel = (ev: PointerEvent) => this.hideDateDialog();
        this.onpointerleave = (ev: PointerEvent) => this.hideDateDialog();

        //append attr tooltip for css hint
        if(this.DateCssHint) {
            this.setAttribute('data-tooltip', `${this.DateHint}${this.renderTimeString(this.DateDialogFormat, false)}`);
        }
        //setup dom elements
        if(this.DateAsString === true) {
            this.innerText = this.renderTimeString(this.DateViewFormat, false);
        } else {
            let spanNode =document.createElement('span');
            spanNode.innerHTML = this.renderTimeString(this.DateViewFormat);
            //replace text with spanNode
            this.innerHTML = spanNode.outerHTML;
        }
    }
    
    hideDateDialog() {
        if(this.ShowDialog && this.DateDialog instanceof HTMLDialogElement) {
            this.DateDialog.close();
            this.DateDialog.parentElement.removeChild(this.DateDialog);
            this.DateDialog = null; 
        }
    }
    showDateDialog() {
        if(this.ShowDialog && this.DateCssHint === false) {
            this.DateDialog = document.createElement('dialog');
            this.DateDialog.style.whiteSpace = 'nowrap';
            this.append(this.DateDialog);
            this.DateDialog.innerHTML = this.renderTimeString(this.DateDialogFormat);
            if(this.DateHint) {
                const spanHint = document.createElement('span');
                spanHint.classList.add('-hint');
                spanHint.innerText = this.DateHint;
                this.DateDialog.prepend(spanHint);
            }
            this.DateDialog.show();
        }
    }
    renderTimeString(formatViewString, asHtml = true):string {
        //get week number of year
        const d = this.Date;
        const resultSpan = document.createElement('span');
        const nowDate = new Date();
        const Yeardiff = nowDate.getFullYear() - d.getFullYear();
        const make = {
            date: ():HTMLSpanElement => {
                const intl = this.intl;
                const spanDate = document.createElement('span');
                spanDate.classList.add('-date');
                const formatDateItems = this.FormatDate.split(',');
                for (let i = 0; i < formatDateItems.length; i++) {
                    const date = formatDateItems[i];
                    //decl month if this use with day
                    if(date === 'month' && formatDateItems.includes('day')) {
                        spanDate.innerHTML += `<span class="-month"> ${intl(['month'], true)} </span>`;
                    } else {
                        if(date === 'year') {
                            spanDate.innerHTML += ` ${Yeardiff > 0 ? `<span class="-year">${intl(['year'])} </span>` : ``}`
                        } else {
                            spanDate.innerHTML += `<span class="-${date}">${intl([date])} </span>`;
                        }
                    }
                }
                return spanDate;
            },
            time: ():HTMLSpanElement => {
                const intl = this.intl;
                const spanTime = document.createElement('span');
                spanTime.classList.add('-time');
                spanTime.innerHTML += `${intl(this.FormatTime.split(','))}`;
                return spanTime;
            },
            ago: ():HTMLSpanElement => {
                const Translate = this.Translate;
                const agoText = Translate('ago');
                const spanAgo = document.createElement('span');
                spanAgo.classList.add('-ago');
                
                //if timeDiff > year
                if(Yeardiff > 0) {
                    spanAgo.innerHTML = `${Yeardiff} ${nw(Yeardiff, Translate('year'))} ${agoText}`;
                    return spanAgo;
                }

                //if timeDiff > month
                const MonthDiff = nowDate.getMonth() - d.getMonth();
                if(MonthDiff > 1) {
                    spanAgo.innerHTML = `${MonthDiff} ${nw(MonthDiff, Translate('month'))} ${agoText}`;
                    return spanAgo;
                }

                //if timeDiff > week
                const WeekDiff = getWeekNumber(nowDate) - getWeekNumber(d);
                if(WeekDiff > 1 && MonthDiff >= 0) {
                    spanAgo.innerHTML = `${WeekDiff} ${nw(WeekDiff, Translate('week'))} ${agoText}`;
                    return spanAgo;
                }
                //if timeDiff > week day
                const DaysDiff = Math.round((nowDate.getTime() - d.getTime())/1000/60/60/24);
                if(DaysDiff > 0 && WeekDiff >= 0) {
                    spanAgo.innerHTML = ` ${DaysDiff} ${nw(DaysDiff, Translate('day'))} ${agoText}`;
                    return spanAgo;
                }
                //if timeDiff > hour
                const HoursDiff = Math.round((nowDate.getTime() - d.getTime())/1000/60/60);
                if(HoursDiff > 0 && DaysDiff < 1) {
                    spanAgo.innerHTML = ` ${HoursDiff} ${nw(HoursDiff, Translate('hour'))} ${agoText}`;
                    return spanAgo;
                }
                //if timeDiff > min
                const MinsDiff = Math.round((nowDate.getTime() - d.getTime())/1000/60);
                if(MinsDiff > 0 && HoursDiff < 1) {
                    spanAgo.innerHTML = ` ${MinsDiff} ${nw(MinsDiff, Translate('minute'))} ${agoText}`;
                    return spanAgo;
                }

                return spanAgo;
            },
        };
        //join to string all nodes
        formatViewString.split(',').map(type => make[type].apply(this)).map(node => resultSpan.append(node));
        
        return asHtml ? resultSpan.innerHTML : resultSpan.innerText;
    }
}

export default WCTime;