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

export const LEGENDRE_FORMULAS: FormulaData = {
  definitions: [
    String.raw`P_n(x) = \frac{1}{2^n} \sum_{k=0}^{n} \binom{n}{k}^2 (x-1)^{n-k}(x+1)^k`,
    String.raw`P_n(x) = 2^n \sum_{k=0}^{n} x^k \binom{n}{k} \binom{\frac{n+k-1}{2}}{n}`,
    String.raw`P_n(x) = \frac{1}{\pi} \int_0^{\pi} \left[x + \sqrt{x^2-1}\,\cos t\right]^n dt, \quad x > 1`,
  ],
  domain: String.raw`I = (-1,\, 1)`,
  equation: String.raw`(1-x^2)\,y''(x) - 2x\,y' + k(k+1)\,y = 0`,
  relations: [
    String.raw`P'_{n+1}(x) - P'_{n-1}(x) = (2n+1)\,P_n(x)`,
    String.raw`P'_{n+1}(x) = (n+1)\,P_n(x) + x\,P'_n(x)`,
    String.raw`P'_{n-1}(x) = -n\,P_n(x) + x\,P'_n(x)`,
    String.raw`P'_n(x) = x\,P'_{n-1}(x) + n\,P_{n-1}(x)`,
    String.raw`(1-x^2)\,P'_n(x) = n\,P_{n-1}(x) - nx\,P_n(x)`,
    String.raw`(1-x^2)\,P'_n(x) = (n+1)\,x\,P_n(x) - (n+1)\,P_{n+1}(x)`,
    String.raw`x\,P_n(x) = \frac{n+1}{2n+1}\,P_{n+1}(x) + \frac{n}{2n+1}\,P_{n-1}(x)`,
  ],
};

export const LAGUERRE_FORMULAS: FormulaData = {
  definitions: [
    String.raw`L_n(x) = \frac{1}{n!}\left(\frac{d}{dx} - 1\right)^n x^n`,
    String.raw`L_n(x) = \sum_{k=0}^{n} \frac{(-1)^k}{k!} \binom{n}{k} x^k`,
    String.raw`L_n(x) = \frac{1}{2\pi i} \oint \frac{e^{\frac{-xz}{1-z}}}{(1-z)\,z^{n+1}}\, dz`,
  ],
  domain: String.raw`x \in \mathbb{R}, \quad n \in \mathbb{N}`,
  equation: String.raw`x\,y'' + (1-x)\,y' + \lambda\,y = 0`,
  relations: [
    String.raw`(n+1)\,L_{n+1}(x) - (2n+1-x)\,L_n(x) + n\,L_{n-1}(x) = 0`,
    String.raw`x\,L'_n(x) = n\,L_n(x) - n\,L_{n-1}(x)`,
    String.raw`L'_n(x) = -\sum_{k=0}^{n-1} L_k(x)`,
    String.raw`L_n(x+y) = \frac{1}{n!}\!\left(-\frac{1}{4}\right)\!\sum_{j=0}^{n} \binom{n}{j} H_{2j}\!\left(\sqrt{x}\right) H_{2n-2j}\!\left(\sqrt{y}\right)`,
  ],
};

export const HERMITE1_FORMULAS: FormulaData = {
  definitions: [
    String.raw`H_n(x) = n!\,\sum_{k=0}^{\lfloor n/2 \rfloor} \frac{(-1)^k}{k!\,(n-2k)!}\,(2x)^{n-2k}`,
    String.raw`H_n(x) = (-1)^n\, e^{x^2} \frac{d^n}{dx^n}\!\left(e^{-x^2}\right)`,
    String.raw`H_n(z) = \frac{n!}{2\pi i} \oint e^{-t^2+2tz}\, t^{-n-1}\, dt`,
  ],
  domain: String.raw`x \in \mathbb{R}, \quad n \in \mathbb{N}_0`,
  equation: String.raw`y'' - x\,y' + n\,y = 0`,
  relations: [
    String.raw`H_n(-x) = (-1)^n H_n(x)`,
    String.raw`H_{n+1}(x) = x\,H_n(x) - H'_n(x)`,
    String.raw`H_{n+1}(x) = 2x\,H_n(x) - H'_n(x)`,
    String.raw`\sum_{k=0}^{\infty} (-1)^k \frac{H_{2k}(x)}{(2k)!} = e\cos(2x)`,
    String.raw`\sum_{k=0}^{\infty} (-1)^k \frac{H_{2k+1}(x)}{(2k+1)!} = e\sin(2x)`,
  ],
};

export const HERMITE2_FORMULAS: FormulaData = {
  definitions: [
    String.raw`\mathit{He}_n(x) = 2^{-\frac{n}{2}}\, H_n\!\left(\frac{x}{\sqrt{2}}\right)`,
  ],
  domain: String.raw`x \in \mathbb{R}, \quad n \in \mathbb{N}_0`,
  equation: String.raw`y'' - 2x\,y' + n\,y = 0`,
  relations: [
    String.raw`H'_n(x) = 2n\,H_{n-1}(x)`,
    String.raw`\mathit{He}_{n+1}(x) = x\,\mathit{He}_n(x) - \mathit{He}'_n(x)`,
  ],
};

export const CHEBYSHEV1_FORMULAS: FormulaData = {
  definitions: [
    String.raw`T_n(x) = \cos(n\,\arccos(x)), \quad |x| \leq 1`,
    String.raw`T_n(\cos\varphi) = \cos(n\,\varphi)`,
    String.raw`T_n(x) = \frac{n}{2}\sum_{m=0}^{\lfloor n/2 \rfloor} (-1)^m \frac{(n-m-1)!}{m!\,(n-2m)!}\,(2x)^{n-2m}`,
  ],
  domain: String.raw`|x| \leq 1, \quad n \in \mathbb{N}_0`,
  equation: String.raw`(1-x^2)\,y'' - x\,y' + \alpha^2\,y = 0`,
  relations: [
    String.raw`T_{n+1}(x) = 2x\,T_n(x) - T_{n-1}(x)`,
    String.raw`T_{n+1}(x) = x\,T_n(x) - \sqrt{(1-x^2)\bigl(1-(T_n(x))^2\bigr)}`,
    String.raw`(x-1)\left[T_{2n+1}(x)-1\right] = \left[T_{n+1}(x)-T_n(x)\right]^2, \quad n \geqslant 1`,
    String.raw`T_{2n}(x) = \left(T_n(x)\right)^2 - 1`,
  ],
};

export const CHEBYSHEV2_FORMULAS: FormulaData = {
  definitions: [
    String.raw`U_n(x) = \frac{\sin\bigl((n+1)x\bigr)}{\sin x}`,
    String.raw`U_n(\cos\varphi)\,\sin\varphi = \sin\bigl((n+1)\varphi\bigr)`,
    String.raw`U_n(x) = \sum_{m=0}^{\lfloor n/2 \rfloor} (-1)^m \frac{(n-m)!}{m!\,(n-2m)!}\,(2x)^{n-2m}`,
  ],
  domain: String.raw`|x| \leq 1, \quad n \in \mathbb{N}_0`,
  equation: String.raw`(1-x^2)\,y'' - x\,y' + \alpha^2\,y = 0`,
  relations: [
    String.raw`U_{n+2}(x) = 2x\,U_{n+1}(x) - U_n(x)`,
    String.raw`(1-x^2)\,U'_n(x) = -nx\,U_n(x) + (n+1)\,U_{n-1}(x)`,
    String.raw`(1-x)^2\,U''_n(x) - 3x\,U'_n(x) + n(n+2)\,U_n(x) = 0`,
    String.raw`U_n(x) = 2\sum_{k=0}^{\lfloor n/2 \rfloor} T_{2k}(x) - 1`,
  ],
};

export const JACOBI_FORMULAS: FormulaData = {
  definitions: [
    String.raw`P_n^{(\alpha,\beta)}(x) = \frac{(-1)^n}{2^n\,n!}(1-x)^{-\alpha}(1+x)^{-\beta}\,\frac{d^n}{dx^n}\!\left[(1-x)^{\alpha+n}(1+x)^{\beta+n}\right]`,
    String.raw`P_n^{(\alpha,\beta)}(x) = \frac{1}{2^n}\sum_{k=0}^{n}\binom{n+\alpha}{k}\binom{n+\beta}{n-k}(x-1)^{n-k}(1+x)^k`,
    String.raw`(1-x)^\alpha(1+x)^\beta\,P_n^{(\alpha,\beta)}(x) = \frac{(-1)^n}{2^n\,n!}\,\frac{d^n}{dx^n}\!\left[(1-x)^{\alpha+n}(1+x)^{\beta+n}\right]`,
  ],
  domain: String.raw`n \in \mathbb{N}_0, \quad x \in \mathbb{R}, \quad \alpha > -1, \quad \beta > -1`,
  equation: String.raw`(1-x^2)\,y'' + \bigl(\beta-\alpha-(\alpha+\beta+2)x\bigr)\,y' + n(n+\alpha+\beta+1)\,y = 0`,
  relations: [
    String.raw`(x+1){P_n^{(\alpha,\beta)}}'(x) = n\,P_n^{(\alpha,\beta)}(x) - (\alpha+n)\,P_n^{(\alpha,\beta+1)}(x)`,
    String.raw`(x+1){P_n^{(\alpha,\beta)}}'(x) = n\,P_n^{(\alpha,\beta)}(x) + (\beta+n)\,P_{n-1}^{(\alpha,\beta+1)}(x)`,
    String.raw`{P_n^{(\alpha,\beta)}}'(x) = \frac{1}{2}(1+\alpha+\beta+n)\,P_{n-1}^{(\alpha+1,\beta+1)}(x)`,
    String.raw`{P_n^{(\alpha,\beta)}}'(x) = \frac{1}{2}\!\left((\beta+n)\,P_n^{(\alpha+1,\beta)}(x) + (\alpha+n)\,P_{n-1}^{(\alpha,\beta+1)}(x)\right)`,
  ],
};

export const LATEX_FORMULAS: Record<string, FormulaData> = {
  bessel1: BESSEL1_FORMULAS,
  gamma: GAMMA_FORMULAS,
  beta: BETA_FORMULAS,
  legendre: LEGENDRE_FORMULAS,
  laguerre: LAGUERRE_FORMULAS,
  hermite1: HERMITE1_FORMULAS,
  hermite2: HERMITE2_FORMULAS,
  chebyshev1: CHEBYSHEV1_FORMULAS,
  chebyshev2: CHEBYSHEV2_FORMULAS,
  jacobi: JACOBI_FORMULAS,
};
