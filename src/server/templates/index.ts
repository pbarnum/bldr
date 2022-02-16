import invitation from './invitation';
import locked from './locked';
import reset from './reset';
import verification from './verification';

interface template {
  text: string;
  html: string;
}

const templates: { [key: string]: template } = {
  locked,
  reset,
  verification,
  invitation,
};

export default templates;
