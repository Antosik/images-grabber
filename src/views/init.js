import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

export default () => {
  clear();
  console.log(
    chalk.blue(
      figlet.textSync('Img Grabber'),
    ),
  );
};

