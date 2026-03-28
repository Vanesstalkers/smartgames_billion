import createLibGameClass = require('../../../lib/game/types/Class');
import type { GameHasDicecubeApi } from '../../../lib/game/types/objects';

export type LibGameInstance = InstanceType<ReturnType<typeof createLibGameClass>>;

export interface DomainGameInstance extends LibGameInstance, GameHasDicecubeApi {
  stepLabel(label: string): string;
  removeTableCards(): void;
  restorePlayersHands(): void;
}

export interface DomainGameClass {
  new (...args: ConstructorParameters<ReturnType<typeof createLibGameClass>>): DomainGameInstance;
}

declare function createDomainGameClass(): DomainGameClass;

export = createDomainGameClass;
