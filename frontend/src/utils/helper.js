import Svg3 from '../assets/SV3.svg';
import Svg1 from '../assets/svg1.svg';
import Svg2 from '../assets/svg2.svg';
export const validateEmail=(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
export const getInitials=(name)=>{
    if(!name)return "";
    const words=name.split(" ");
    let initials="";
    for(let i=0;i<Math.min(words.length,2);i++){
            initials+=words[i][0];
    }
    return initials.toUpperCase();
}
export const getEmptyCardMessage=(filterType)=>{
    switch(filterType){
        case "search":
            return "oops! no stories found matching your search";
        case "date":
            return "No stories found in the given date";
        default:
            return "Start creating your first Travel Story! "

    }

}
export const getEmptyCardImg=(filterType)=>{
    switch(filterType){
        case "search":
            return Svg3;
        case "date":
            return Svg2;
        default:
            return Svg1

    }

}