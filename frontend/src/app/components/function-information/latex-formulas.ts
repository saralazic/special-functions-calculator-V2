export interface FormulaData {
  definitions: string[];
  domain: string;
  equation: string;
  relations: string[];
}

export const BESSEL1_FORMULAS: FormulaData = {
  definitions: [
    String.raw`J_\alpha(x) = \sum_{m=0}^{\infty} \frac{(-1)^m \left(\dfrac{x}{2}\right)^{\alpha+2m}}{m!\; \Gamma(\alpha + m + 1)}`,
    String.raw`J_n(x) = \sum_{m=0}^{\infty} \frac{(-1)^m}{(m+n)!\; m!} \left(\frac{x}{2}\right)^{2m+n}`,
    String.raw`J_\alpha(x) = \frac{1}{2\pi} \int_{-\pi}^{\pi} e^{-i(n\tau - x \sin \tau)}\, d\tau`,
  ],
  domain: String.raw`x \in \mathbb{R}, \quad n \in \mathbb{N}_0`,
  equation: String.raw`x^2 y'' + x y' + (x^2 - \alpha^2) y = 0`,
  relations: [
    String.raw`\cos x = J_0(x) + 2 \sum_{n=1}^{\infty} (-1)^n\, J_{2n}(x)`,
    String.raw`\sin x = 2 \sum_{n=0}^{\infty} (-1)^n\, J_{2n+1}(x)`,
    String.raw`1 = J_0(x) + 2 \sum_{n=1}^{\infty} J_{2n}(x)`,
    String.raw`J_n(-x) = J_{-n}(x) = (-1)^n J_n(x)`,
    String.raw`\frac{d}{dx}\!\left[x^{-\alpha}\, J_\alpha(x)\right] = -x^{-\alpha}\, J_{\alpha+1}(x)`,
    String.raw`\frac{d}{dx}\!\left[x^{\alpha}\, J_\alpha(x)\right] = x^{\alpha}\, J_{\alpha-1}(x)`,
  ],
};

export const LATEX_FORMULAS: Record<string, FormulaData> = {
  bessel1: BESSEL1_FORMULAS,
};
