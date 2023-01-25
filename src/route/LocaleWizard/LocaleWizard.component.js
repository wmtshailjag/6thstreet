import { PureComponent } from 'react';

import HeaderLogo from 'Component/HeaderLogo';
import WelcomeScreen from 'Component/WelcomeScreen';
import { isArabic } from 'Util/App';

import './LocaleWizard.style';

class LocaleWizard extends PureComponent {
    state = {
        isArabic: false
    };

    checkWizardLang = () => {
        this.setState({ isArabic: isArabic() });
    };

    render() {
        const { isArabic } = this.state;
        return (
            <div block="LocaleWizard">
                <div block="LocaleWizard" elem="Background" />
                <div block="LocaleWizard" elem="ContentWrapper">
                    <div block="LocaleWizard" elem="Logo" mods={ { isArabic } }>
                        <HeaderLogo />
                    </div>
                    <WelcomeScreen checkWizardLang={ this.checkWizardLang } />
                </div>
            </div>
        );
    }
}

export default LocaleWizard;
