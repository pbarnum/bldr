import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { AppContext } from '../App';
import AvailableOutputs from '../components/AvailableOutputs';
import CompiledHeader from '../components/CompiledHeader';
import DisplayOutput from '../components/DisplayOutput';
import Unauthorized from '../components/Unauthorized';
import storage from '../storage';
import { Output } from '../types/output';

const Compiled = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const { userId } = useParams();
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);

  useEffect(() => {
    document.title = 'Compiled - Bldr';
  }, []);

  const selectedOutputCallback = (output: Output | null) => {
    setSelectedOutput(output);
  };

  if (!ctx.user || !storage.isUser || !userId) {
    return <Unauthorized title="Unauthorized" message="You cannot view output files without being logged in!" />;
  }

  return (
    <>
      <CompiledHeader />
      <AvailableOutputs userId={userId} selectedCallback={selectedOutputCallback} />
      <hr className="my-4" />
      <DisplayOutput output={selectedOutput} />
    </>
  );
};

export default Compiled;
