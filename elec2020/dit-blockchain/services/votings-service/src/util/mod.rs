
use failure::Error;
use std::convert::TryInto;

pub fn read_le_u32(input: &[u8]) -> Result<u32, Error> {
  let u32_size = 4;
  let padding = [0; 4];

  let padded_input = [input, &padding].concat();
  let (int_bytes, _) = padded_input.split_at(u32_size);
  let int_arr: [u8; 4] = int_bytes.try_into()?;

  Ok(u32::from_le_bytes(int_arr))
}