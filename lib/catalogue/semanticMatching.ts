import { getSemanticRule } from './semanticConfig';
import { SEMANTIC_CATEGORIES } from './semanticConfig';

export interface Product {
  name: string;
  brand: string;
  slug?: { current: string };
  overviewFields?: Array<{ title: string; value: string }>;
  specifications?: Array<{ title: string; value: string }>;
}

export interface SemanticMatchResult {
  score: number;
  reasons: string[];
  concerns: string[];
  categorySlug: string;
  categoryTitle: string;
}

export interface SemanticMatchSummary {
  categorySlug: string;
  categoryTitle: string;
  totalProducts: number;
  validMatches: number; // score >= 80
  moderateMatches: number; // score 60-79
  invalidMatches: number; // score < 60
  averageScore: number;
  results: SemanticMatchResult[];
}

const normalizeString = (str: string): string => {
  return str.toLowerCase().trim();
};

const containsKeyword = (text: string, keyword: string): boolean => {
  const normalizedText = normalizeString(text);
  const normalizedKeyword = normalizeString(keyword);
  return normalizedText.includes(normalizedKeyword);
};

const calculateKeywordScore = (
  text: string,
  keywords: string[],
  weight: number
): { score: number; matches: string[] } => {
  let score = 0;
  const matches: string[] = [];

  for (const keyword of keywords) {
    if (containsKeyword(text, keyword)) {
      score += weight;
      matches.push(keyword);
    }
  }

  return { score, matches };
};

export const analyzeSemanticMatch = (
  product: Product,
  categorySlug: string
): SemanticMatchResult => {
  const rule = getSemanticRule(categorySlug);

  if (!rule) {
    return {
      score: 0,
      reasons: ['No semantic rule found for category'],
      concerns: ['Category not configured'],
      categorySlug,
      categoryTitle: categorySlug
    };
  }

  const reasons: string[] = [];
  const concerns: string[] = [];
  let totalScore = 0;

  // Start with base score
  totalScore = 50;

  // Required keywords check (must pass)
  if (rule.requiredKeywords && rule.requiredKeywords.length > 0) {
    const { score: requiredScore, matches: requiredMatches } = calculateKeywordScore(
      product.name,
      rule.requiredKeywords,
      rule.weightings.required
    );

    if (requiredMatches.length === 0) {
      concerns.push(`Missing required keywords: ${rule.requiredKeywords.join(', ')}`);
      totalScore -= 40; // Heavy penalty for missing required keywords
    } else {
      reasons.push(`Found required keywords: ${requiredMatches.join(', ')}`);
      totalScore += requiredScore;
    }
  }

  // Positive keywords
  const { score: positiveScore, matches: positiveMatches } = calculateKeywordScore(
    product.name,
    rule.positiveKeywords,
    rule.weightings.positive
  );

  if (positiveMatches.length > 0) {
    reasons.push(`Found positive keywords: ${positiveMatches.join(', ')}`);
    totalScore += positiveScore;
  }

  // Negative keywords (penalty)
  const { score: negativeScore, matches: negativeMatches } = calculateKeywordScore(
    product.name,
    rule.negativeKeywords,
    rule.weightings.negative
  );

  if (negativeMatches.length > 0) {
    concerns.push(`Found negative keywords: ${negativeMatches.join(', ')}`);
    totalScore += negativeScore; // negativeScore is already negative
  }

  // Brand matching
  if (rule.brandMatches && rule.brandMatches.length > 0) {
    const brandMatch = rule.brandMatches.some(brand =>
      containsKeyword(product.brand, brand)
    );

    if (brandMatch) {
      reasons.push(`Brand match: ${product.brand}`);
      totalScore += rule.weightings.brand;
    }
  }

  // Name scoring (check if category name appears in product name)
  const nameScore = calculateKeywordScore(
    product.name,
    [rule.title, rule.slug],
    rule.weightings.name
  );

  if (nameScore.matches.length > 0) {
    reasons.push(`Name contains category terms: ${nameScore.matches.join(', ')}`);
    totalScore += nameScore.score;
  }

  // Check overview fields for additional context
  if (product.overviewFields) {
    for (const field of product.overviewFields) {
      const { matches: overviewMatches } = calculateKeywordScore(
        field.value,
        rule.positiveKeywords,
        rule.weightings.positive * 0.5 // Lower weight for overview fields
      );

      if (overviewMatches.length > 0) {
        reasons.push(`Overview field "${field.title}" contains: ${overviewMatches.join(', ')}`);
        totalScore += overviewMatches.length * (rule.weightings.positive * 0.5);
      }
    }
  }

  // Check specifications for additional context
  if (product.specifications) {
    for (const spec of product.specifications) {
      const { matches: specMatches } = calculateKeywordScore(
        spec.value,
        rule.positiveKeywords,
        rule.weightings.positive * 0.3 // Lower weight for specifications
      );

      if (specMatches.length > 0) {
        reasons.push(`Specification "${spec.title}" contains: ${specMatches.join(', ')}`);
        totalScore += specMatches.length * (rule.weightings.positive * 0.3);
      }
    }
  }

  // Ensure score is within 0-100 range
  totalScore = Math.max(0, Math.min(100, totalScore));

  return {
    score: Math.round(totalScore),
    reasons,
    concerns,
    categorySlug,
    categoryTitle: rule.title
  };
};

export const analyzeSemanticMatches = (
  products: Product[],
  categorySlug: string
): SemanticMatchSummary => {
  const rule = getSemanticRule(categorySlug);

  if (!rule) {
    return {
      categorySlug,
      categoryTitle: categorySlug,
      totalProducts: products.length,
      validMatches: 0,
      moderateMatches: 0,
      invalidMatches: products.length,
      averageScore: 0,
      results: products.map(product => ({
        score: 0,
        reasons: ['No semantic rule found for category'],
        concerns: ['Category not configured'],
        categorySlug,
        categoryTitle: categorySlug
      }))
    };
  }

  const results = products.map(product => analyzeSemanticMatch(product, categorySlug));

  const validMatches = results.filter(r => r.score >= 80).length;
  const moderateMatches = results.filter(r => r.score >= 60 && r.score < 80).length;
  const invalidMatches = results.filter(r => r.score < 60).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return {
    categorySlug,
    categoryTitle: rule.title,
    totalProducts: products.length,
    validMatches,
    moderateMatches,
    invalidMatches,
    averageScore: Math.round(averageScore),
    results
  };
};

export const getScoreIndicator = (score: number): string => {
  if (score >= 80) return '✅';
  if (score >= 60) return '⚠️';
  return '❌';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'VALID';
  if (score >= 60) return 'MODERATE';
  return 'MISMATCH';
};
