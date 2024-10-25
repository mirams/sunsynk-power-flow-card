import {unitOfEnergyConversionRules, UnitOfEnergyOrPower, UnitOfPower} from '../const';
import { navigate } from 'custom-card-helpers';''

export class Utils {
    static toNum(val: string | number, decimals: number = -1, invert: boolean = false): number {
        let numberValue = Number(val);
        if (Number.isNaN(numberValue)) {
            return 0;
        }
        if (decimals >= 0) {
            numberValue = parseFloat(numberValue.toFixed(decimals));
        }
        if (invert) {
            numberValue *= -1;
        }
        return numberValue;
    }

    static convertValue(value, decimal = 2) {
        decimal = Number.isNaN(decimal) ? 2 : decimal;
        if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(decimal)} MW`;
        } else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(decimal)} kW`;
        } else {
            return `${Math.round(value)} W`;
        }
    }

    static convertValueNew(value: string | number, unit: UnitOfEnergyOrPower | string = '', decimal: number = 2) {
        decimal = isNaN(decimal) ? 2 : decimal;
        const numberValue = Number(value);
        if (isNaN(numberValue)) return 0;

        const rules = unitOfEnergyConversionRules[unit];
        if (!rules) return `${numberValue.toFixed(decimal)} ${unit}`;

        if (unit === UnitOfPower.WATT && Math.abs(numberValue) < 1000) {
            return `${Math.round(numberValue)} ${unit}`;
        };

        if (unit === UnitOfPower.KILO_WATT && Math.abs(numberValue) < 1) {
            return `${Math.round(numberValue * 1000)} W`;
        };

        if (unit === UnitOfPower.MEGA_WATT && Math.abs(numberValue) < 1) {
            return `${(numberValue * 1000).toFixed(decimal)} kW`;
        };

        for (const rule of rules) {
            if (Math.abs(numberValue) >= rule.threshold) {
                const convertedValue = (numberValue / rule.divisor).toFixed(rule.decimal || decimal);
                return `${convertedValue} ${rule.targetUnit}`;
            }
        };

        return `${numberValue.toFixed(decimal)} ${unit}`;
    }

    private static isPopupOpen = false;

    static handlePopup(event, entityId) {
        if (!entityId) {
          return;
        }
        event.preventDefault();
        this._handleClick(event, { action: 'more-info' }, entityId);
      }

    static handleNavigation(event, navigationPath,) {
        if (!navigationPath) {
          return;
        }
        event.preventDefault();
        this._handleClick(event, { action: 'navigate', navigation_path: navigationPath }, null);
      }

      private static _handleClick(event, actionConfig, entityId) {
        if (!event || (!entityId && !actionConfig.navigation_path)) {
          return;
        }

        event.stopPropagation();

        // Handle different actions based on actionConfig
        switch (actionConfig.action) {
          case 'more-info':
            this._dispatchMoreInfoEvent(event, entityId);
            break;

          case 'navigate':
            this._handleNavigationEvent(event, actionConfig.navigation_path);
            break;

          default:
            console.warn(`Action '${actionConfig.action}' is not supported.`);
        }
      }

      private static _dispatchMoreInfoEvent(event, entityId) {
        if (Utils.isPopupOpen) {
            return;
          }

        Utils.isPopupOpen = true;

        const moreInfoEvent = new CustomEvent('hass-more-info', {
          composed: true,
          detail: { entityId },
        });

        history.pushState({ popupOpen: true }, '', window.location.href);

        event.target.dispatchEvent(moreInfoEvent);

        const closePopup = () => {
            if (Utils.isPopupOpen) {
                Utils.isPopupOpen = false;
                window.removeEventListener('popstate', closePopup);
                history.back(); // Optionally close the popup with history.back() if needed
                }
        };

        window.addEventListener('popstate', closePopup, { once: true });
      }

      private static _handleNavigationEvent(event, navigationPath) {
        // Perform the navigation action
        if (navigationPath) {
          navigate(event.target, navigationPath); // Assuming 'navigate' is a function available in your environment
        } else {
          console.warn("Navigation path is not provided.");
        }
        }
}
