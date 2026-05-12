export type FitPreference = "regular" | "slim" | "fuller" | "oversize";

export type SuggestedSize = {
    standardSize: string;
    reason: string;
};

type SizeRule = {
    name: string;
    heightMin: number;
    heightMax: number;
    weightMin: number;
    weightMax: number;
};

const SIZE_RULES: SizeRule[] = [
    { name: "XXS", heightMin: 0, heightMax: 155, weightMin: 0, weightMax: 42 },
    { name: "XS", heightMin: 150, heightMax: 160, weightMin: 40, weightMax: 48 },
    { name: "S", heightMin: 155, heightMax: 165, weightMin: 45, weightMax: 55 },
    { name: "M", heightMin: 160, heightMax: 170, weightMin: 52, weightMax: 62 },
    { name: "L", heightMin: 165, heightMax: 175, weightMin: 60, weightMax: 72 },
    { name: "XL", heightMin: 170, heightMax: 180, weightMin: 70, weightMax: 82 },
    { name: "XXL", heightMin: 172, heightMax: 185, weightMin: 80, weightMax: 92 },
    { name: "XXXL", heightMin: 175, heightMax: 190, weightMin: 90, weightMax: 105 },
    { name: "4XL", heightMin: 175, heightMax: 195, weightMin: 100, weightMax: 115 },
    { name: "5XL", heightMin: 180, heightMax: 200, weightMin: 110, weightMax: 130 },
    { name: "Free Size", heightMin: 155, heightMax: 190, weightMin: 45, weightMax: 90 },
];

const SIZE_ORDER = SIZE_RULES.map((rule) => rule.name.toUpperCase());

const normalizeSizeName = (value: string) => value.trim().toUpperCase().replace(/\s+/g, " ");

const getRangeDistance = (value: number, min: number, max: number) => {
    if (value < min) {
        return min - value;
    }

    if (value > max) {
        return value - max;
    }

    return 0;
};

const getBaseRuleIndex = (height: number, weight: number) => {
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    SIZE_RULES.forEach((rule, index) => {
        const heightScore = getRangeDistance(height, rule.heightMin, rule.heightMax);
        const weightScore = getRangeDistance(weight, rule.weightMin, rule.weightMax);
        const centerHeight = (rule.heightMin + rule.heightMax) / 2;
        const centerWeight = (rule.weightMin + rule.weightMax) / 2;
        const centerPenalty = Math.abs(height - centerHeight) / 10 + Math.abs(weight - centerWeight) / 6;
        const totalScore = heightScore * 1.1 + weightScore * 1.35 + centerPenalty;

        if (totalScore < bestScore) {
            bestScore = totalScore;
            bestIndex = index;
        }
    });

    return bestIndex;
};

const applyFitPreference = (index: number, preference: FitPreference, height: number, weight: number) => {
    if (preference === "oversize") {
        return Math.min(index + 1, SIZE_RULES.length - 1);
    }

    if (preference === "slim") {
        const current = SIZE_RULES[index];
        const closeToLowerBound = height <= current.heightMin + 2 && weight <= current.weightMin + 2;
        return closeToLowerBound ? Math.max(index - 1, 0) : index;
    }

    if (preference === "fuller") {
        const current = SIZE_RULES[index];
        const closeToUpperBound = height >= current.heightMax - 2 || weight >= current.weightMax - 2;
        return closeToUpperBound ? Math.min(index + 1, SIZE_RULES.length - 1) : index;
    }

    return index;
};

export const findSuggestedSize = (
    height: number,
    weight: number,
    fitPreference: FitPreference = "regular"
): SuggestedSize => {
    const sanitizedHeight = Number.isFinite(height) ? height : 0;
    const sanitizedWeight = Number.isFinite(weight) ? weight : 0;

    if (sanitizedHeight <= 0 || sanitizedWeight <= 0) {
        return {
            standardSize: "M",
            reason: "Nhập chiều cao và cân nặng hợp lệ để gợi ý size chính xác hơn.",
        };
    }

    const baseIndex = getBaseRuleIndex(sanitizedHeight, sanitizedWeight);
    const adjustedIndex = applyFitPreference(baseIndex, fitPreference, sanitizedHeight, sanitizedWeight);
    const suggested = SIZE_RULES[adjustedIndex];

    return {
        standardSize: suggested.name,
        reason: `Đề xuất ${suggested.name} dựa trên chiều cao ${sanitizedHeight}cm và cân nặng ${sanitizedWeight}kg.`,
    };
};

export const getNearestAvailableSize = (suggestedSize: string, availableSizeNames: string[]) => {
    if (availableSizeNames.length === 0) {
        return null;
    }

    const normalizedSuggested = normalizeSizeName(suggestedSize);
    const exactMatch = availableSizeNames.find((name) => normalizeSizeName(name) === normalizedSuggested);

    if (exactMatch) {
        return exactMatch;
    }

    const suggestedIndex = SIZE_ORDER.indexOf(normalizedSuggested);

    if (suggestedIndex === -1) {
        return availableSizeNames[0];
    }

    let bestName = availableSizeNames[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    availableSizeNames.forEach((name) => {
        const index = SIZE_ORDER.indexOf(normalizeSizeName(name));
        if (index === -1) {
            return;
        }

        const distance = Math.abs(index - suggestedIndex);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestName = name;
        }
    });

    return bestName;
};
