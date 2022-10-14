import { FC, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { defaultMinecraftConfig, MinecraftStackMetadata, MinecraftStackConfig } from '@minecraft-manager/shared';
import { TextInput } from '../components/TextInput';
import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';
import { object, string, ValidationError } from 'yup';
import { createStack } from '../libs/api';

const metadataValidator = object({
  name: string().required('Please provide a name for your server'),
  description: string(),
  owner: string().oneOf(['Evan', 'Maxwell', 'Daddy']).required('Please select the server owner'),
});

const configValidator = object({
  seed: string(),
  gameMode: string().oneOf(['creative','survival','adventure','spectator']).required('Please select a game mode'),
  levelType: string().oneOf(['minecraft:normal','minecraft:flat','minecraft:large_biomes','minecraft:amplified','minecraft:single_biome_surface']).required('Please select a level type'),
  difficulty: string().oneOf(['0', '1', '2', '3']).required('Please select a difficulty'),
});

type MetadataValidator = typeof metadataValidator;
type ConfigValidator = typeof configValidator;

export const Create: FC = (props: Record<string, any>) => {
  const validate = (validator: MetadataValidator | ConfigValidator, values: Partial<MinecraftStackMetadata | MinecraftStackConfig>): any => {
    try {
      validator.validateSync(values, { abortEarly: false });
      return {};
    } catch (err) {
      const updatedErrors: Record<string, string> = {};
      (err as ValidationError).inner.forEach((inner: ValidationError) => {
        updatedErrors[`${inner.path}`] = inner.errors.join(', ').trim();
      });
      return updatedErrors;
    }
  };

  const getAllErrors = (metadata: Partial<MinecraftStackMetadata>, config: Partial<MinecraftStackConfig>) => ({
    ...validate(metadataValidator, metadata),
    ...validate(configValidator, config),
  });

  const [saveIsDisabled, setSaveIsDisabled] = useState(true);
  const [config, setConfig] = useState({ ...defaultMinecraftConfig } as Partial<MinecraftStackConfig>);
  const [metadata, setMetadata] = useState({} as Partial<MinecraftStackMetadata>);
  const [errors, setErrors] = useState({ ...validate(metadataValidator, metadata), ...validate(configValidator, config) });

  const onChangeMetadata = (key: string, value: string | boolean) => {
    const updatedErrors = getAllErrors({ ...metadata, [key]: value }, config);
    setSaveIsDisabled(!!Object.keys(updatedErrors).length);
    setErrors(updatedErrors);
    setMetadata({ ...metadata, [key]: value });
  };

  const onChangeConfig = (key: string, value: string | boolean) => {
    const updatedConfig = { ...config, [key]: value };
    const updatedErrors = getAllErrors(metadata, updatedConfig);
    setSaveIsDisabled(!!Object.keys(updatedErrors).length);
    setErrors(updatedErrors);
    setConfig({ ...config, [key]: value });
  };

  const onClickSave = async () => {
    setSaveIsDisabled(true);
    await createStack(config, metadata);
    setSaveIsDisabled(false);
    // @TODO add router-friendly redirect
    // location.href = "/";
  };

  return (
    <form>
      <TextInput
        name="name"
        label="Name"
        placeholder="Server name"
        value={ metadata.name || '' }
        required
        onChange={ onChangeMetadata }
        error={ errors.name }
      />

      <label htmlFor="description">
        Description
        <textarea id="description" name="description" placeholder="Description" required onChange={ (event) => onChangeMetadata('description', event.currentTarget.value) } />
      </label>


      <Select
        name="owner"
        label="Owner"
        required
        nullMessage="Select an owner..."
        value={ metadata.owner || '' }
        error={ errors.owner }
        options={ [
          { label: 'Evan', value: 'Evan' },
          { label: 'Maxwell', value: 'Maxwell' },
          { label: 'Daddy', value: 'Daddy' },
        ] }
        onChange={ onChangeMetadata }
      />

      <TextInput
        name="seed"
        label="Seed"
        placeholder="Seed value"
        value={ config.seed || '' }
        onChange={ onChangeConfig }
      />

      <div className="grid">
        {/* column 1 */}
        <div>
          <Select
            name="gameMode"
            label="Game Mode"
            required
            nullMessage="Select a game mode..."
            value={ `${config.gameMode}` }
            error={ errors.gameMode }
            options={ [
              { label: 'Creative', value: 'creative' },
              { label: 'Survival', value: 'survival' },
              { label: 'Adventure', value: 'adventure' },
              { label: 'Spectator', value: 'spectator' },
            ] }
            onChange={ onChangeConfig }
          />

          <Select
            name="levelType"
            label="Level Type"
            required
            nullMessage="Select a level type..."
            value={ `${config.levelType}` }
            error={ errors.levelType }
            options={ [
              { label: 'Normal', value: 'minecraft:normal' },
              { label: 'Flat', value: 'minecraft:flat' },
              { label: 'Large Biomes', value: 'minecraft:large_biomes' },
              { label: 'Amplified', value: 'minecraft:amplified' },
              { label: 'Single Biome', value: 'minecraft:single_biome_surface' },
            ] }
            onChange={ onChangeConfig }
          />

          <Select
            name="difficulty"
            label="Difficulty"
            required
            nullMessage="Select a difficulty..."
            value={ `${config.difficulty}` }
            error={ errors.difficulty }
            options={ [
              { label: 'Peaceful', value: '0' },
              { label: 'Easy', value: '1' },
              { label: 'Normal', value: '2' },
              { label: 'Hard', value: '3' },
            ] }
            onChange={ onChangeConfig }
          />

          <Checkbox name="hardcore" label="Hardcore" value={ !!config.hardcore } onChange={ onChangeConfig } />
        </div>

        {/* column 2 */}
        <div>
          <Checkbox name="allowNether" label="Allow Nether" value={ !!config.allowNether } onChange={ onChangeConfig } />
          <Checkbox name="generateStructures" label="Generate Structures" value={ !!config.generateStructures } onChange={ onChangeConfig } />
          <Checkbox name="spawnAnimals" label="Spawn Animals" value={ !!config.spawnAnimals } onChange={ onChangeConfig } />
          <Checkbox name="spawnMonsters" label="Spawn Monsters" value={ !!config.spawnMonsters } onChange={ onChangeConfig } />
          <Checkbox name="spawnNpcs" label="Spawn NPCs" value={ !!config.spawnNpcs } onChange={ onChangeConfig } />
          <Checkbox name="announcePlayerAchievements" label="Announce Player Achievements" value={ !!config.announcePlayerAchievements } onChange={ onChangeConfig } />
          <br />
          <Checkbox name="pvp" label="Enable PvP" value={ !!config.pvp } onChange={ onChangeConfig } />
        </div>
      </div>

      <br />
      <button
        type="button"
        disabled={ saveIsDisabled }
        onClick={ onClickSave }
      >Save &amp; Start the Server!</button>
    </form>
  );
};
