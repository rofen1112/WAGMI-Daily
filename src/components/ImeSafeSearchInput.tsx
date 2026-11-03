import { Input } from 'antd';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CompositionEvent } from 'react';

interface ImeSafeSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
}

export default function ImeSafeSearchInput({
  value,
  onValueChange,
  className,
  placeholder,
  allowClear = true,
}: ImeSafeSearchInputProps) {
  const [draft, setDraft] = useState(value);
  const composing = useRef(false);
  const committedValue = useRef(value);

  useEffect(() => {
    if (composing.current) return;
    committedValue.current = value;
    setDraft(value);
  }, [value]);

  const commit = useCallback((next: string) => {
    if (composing.current || committedValue.current === next) return;
    committedValue.current = next;
    onValueChange(next);
  }, [onValueChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    const nativeEvent = event.nativeEvent as InputEvent;
    if (!composing.current && !nativeEvent.isComposing) commit(next);
  };

  const handleCompositionStart = () => {
    composing.current = true;
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    const next = event.currentTarget.value;
    setDraft(next);
    commit(next);
  };

  return (
    <Input.Search
      className={className}
      allowClear={allowClear}
      placeholder={placeholder}
      value={draft}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onSearch={commit}
    />
  );
}
