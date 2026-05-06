export const OCCASIONS = ['Birthday','Anniversary','Wedding','Housewarming','Graduation','Retirement','Baby Shower',"Valentine's Day",'Christmas',"Mother's Day","Father's Day",'Thank You','Just Because','Other'];
export const BUDGETS = ['Under $25','$25-$50','$50-$100','$100-$200','$200-$500','Luxury ($500+)'];
export const TONES = ['Sentimental','Funny','Functional','Elegant','Adventurous','Cozy','Romantic','Quirky'];
export const RANK_BADGES = ['Top Pick','Runner Up','Hidden Gem','Wild Card','Crowd Pleaser'];

export const buildAmazonLink = (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=naveja-20`;
