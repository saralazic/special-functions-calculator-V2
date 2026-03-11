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

export const GAMMA_FORMULAS: FormulaData = {
  definitions: [
    String.raw`\Gamma(x) = \int_0^{\infty} e^{-t}\, t^{x-1}\, dt`,
    String.raw`\Gamma(x) = 2 \int_0^{1} \left(\ln \frac{1}{t}\right)^{x-1} dt`,
    String.raw`\Gamma(x+1) = \prod_{j=1}^{\infty} \frac{(j+1)^x}{(j+x) \cdot j^{x-1}}`,
  ],
  domain: String.raw`x \in \mathbb{R}, \quad x > 0`,
  equation: '',
  relations: [
    String.raw`\Gamma(1+x) = x \cdot \Gamma(x)`,
    String.raw`\Gamma(x+n) = x(x+1)(x+2) \ldots (x+n-1)\,\Gamma(x)`,
    String.raw`\Gamma(x) \cdot \Gamma(1-x) = \frac{\pi}{\sin \pi x}`,
    String.raw`\Gamma(2x) = \frac{2^{2x-1}}{\sqrt{\pi}}\,\Gamma(x) \cdot \Gamma\!\left(x + \frac{1}{2}\right)`,
  ],
};

export const BETA_FORMULAS: FormulaData = {
  definitions: [
    String.raw`B(p,q) = \frac{\Gamma(p) \cdot \Gamma(q)}{\Gamma(p+q)}`,
    String.raw`B(p+1,\, q+1) = \int_0^{1} t^p (1-t)^q\, dt`,
    String.raw`B(p,q) = 2 \int_0^{\frac{\pi}{2}} (\sin t)^{2p-1} (\cos t)^{2q-1}\, dt`,
  ],
  domain: String.raw`p,\, q \in \mathbb{R}, \quad p,\, q > 0`,
  equation: '',
  relations: [
    String.raw`B(p+1,\, q) = \frac{p}{p+q}\, B(p,q)`,
    String.raw`B(p,\, q+1) = \frac{q}{p+q}\, B(p,q)`,
    String.raw`B(p+1,\, q) = \frac{p}{q} \cdot B(p,\, q+1)`,
    String.raw`B(p,q) \cdot B(p+q,\, r) = B(q,r) \cdot B(p,\, q+r)`,
  ],
};

export const LATEX_FORMULAS: Record<string, FormulaData> = {
  bessel1: BESSEL1_FORMULAS,
  gamma: GAMMA_FORMULAS,
  beta: BETA_FORMULAS,
};
