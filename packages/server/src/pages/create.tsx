import { FC, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { GetServerSideProps } from 'next';
import { defaultMinecraftConfig, MinecraftStackMetadata, MinecraftStackConfig } from '../shared/types';
import { TextInput } from '../client/components/TextInput';
import { Checkbox } from '../client/components/Checkbox';
import { Select } from '../client/components/Select';

const Create: FC = (props: Record<string, any>) => {
  const [config, setConfig] = useState({ ...defaultMinecraftConfig } as Partial<MinecraftStackConfig>);
  const [metadata, setMetadata] = useState({} as Partial<MinecraftStackMetadata>);

  const onChangeMetadata = (key: string, value: string | boolean) => {
    setMetadata({ ...metadata, [key]: value });
  };

  const onChangeConfig = (key: string, value: string | boolean) => {
    setConfig({ ...config, [key]: value });
  };

  const onClickSave = (event) => {
    console.log('...meta', JSON.stringify(metadata, null, 2));
    console.log('...config', JSON.stringify(config, null, 2));
    // @TODO validate
    // @TODO call API
    // @TODO redirect back to "/"
  };

  return (
    <div className="container">
      <h1>Servers</h1>
      <form>

        <TextInput
          name="name"
          label="Name"
          placeholder="Server name"
          value={ metadata.name || '' }
          required
          onChange={ onChangeMetadata }
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
          value={ metadata.owner }
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
              value={ config.gameMode }
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
              value={ config.levelType }
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
              value={ config.difficulty }
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
        <button type="button" onClick={ onClickSave }>Save &amp; Start the Server!</button>
      </form>
    </div>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  return {
    props: {}
  };
};